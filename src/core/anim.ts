import { Anim, AnimateParams, AnimEntity, ControlParams, Selector, StyleElement, SelectorContext, Instructions, IterationParams, AnimMarker, AnimTimeLine, AnimContainer, AnimPlayer, PlayArguments } from './types';
import { easeOutElastic } from './easings';

const FRAME_MS = 16, MAX_TIME = Number.MAX_SAFE_INTEGER, MAX_ASYNC = 100, IDENTITY = x => x, MAX_TL_DURATION_MS = 600000; // 10mn
let ASYNC_COUNTER = 0; // count the changes that can be triggered by an async call
let AE_COUNT = 0;

/**
 * Convert a duration in a number of frames (a frame = 16 ms at speed 1)
 * @param durationMs 
 */
function convertDuration(durationMs: number, speed: number): number {
    return Math.round(durationMs / speed / FRAME_MS) * FRAME_MS;
}

let log = (...args: any[]) => { };
export function activateLogs() {
    log = (...args: any[]) => console.log.apply(console, args);
}

const defaultSettings: ControlParams = {
    easing: easeOutElastic,
    duration: 1000,
    delay: 0,
    release: 0,
    elasticity: 500,
    speed: 1
}

export async function exhaustAsyncPipe() {
    //console.log(" >>> exhaustAsyncPipe start");
    let c1 = -1, c2 = ASYNC_COUNTER, count = 0;
    while (c1 !== c2 && count < MAX_ASYNC) {
        // c1 !== c2 means that some async callbacks have been run on the animation engine as ASYNC_COUNTER changed
        await Promise.resolve();
        c1 = c2;
        c2 = ASYNC_COUNTER;
        if (count === 0) {
            // force at least 2 rounds
            // the first await allows animations to add new instructions on the await queue (and these awaits don't increment ASYNC_COUNTER)
            c1 = -1;
        }
        count++;
    }
    //console.log(" <<< exhaustAsyncPipe end:", count);
    if (count == MAX_ASYNC) {
        throw new Error("Max async loop reached");
    }
}

export class TimeLine implements Anim, AnimEntity, AnimTimeLine, AnimContainer {
    static convertDuration = convertDuration;
    skipRendering = false;
    selectorCtxt: SelectorContext | undefined;
    isRunning = false;
    startRegistered = false;
    endRegistered = false;
    startTime = 0;
    currentTime = -1;
    endTime = -1;
    moveTarget = 0;
    nextEntity: AnimEntity | null = null;
    firstMarker: AnimMarker | undefined;
    currentMarker: AnimMarker | undefined;
    lastMarker: AnimMarker | undefined;
    parent: TimeLine | undefined;
    settings: ControlParams = defaultSettings;
    rList: AnimEntity | null = null; // linked list of running entities
    lastTargetTime = -1;             // position of the last target frame
    lastTargetForward = true;        // true if the last target was going forward (i.e. time increase)
    tlFunctionCalled = false;        // true when the tl function has been called
    tlFunctionComplete = false;      // true when the tl function has returned
    released = false;
    done = false;                    // true when all child entities have been run
    releaseCb: Function | undefined;

    constructor(public name: string, public tlFunction: (a: Anim) => void) { }

    attach(parent: TimeLine) {
        if (!this.parent) {
            this.parent = parent;
            this.settings = parent.settings;
            this.selectorCtxt = parent.selectorCtxt;
            //this.currentTime = this.startTime = parent.currentTime;
            parent.addEntity(this);
        }
    }

    init(startTime: number) {
        this.startTime = startTime;
    }

    /**
     * Create a promise that will be fulfilled when the context is released
     * Note: can only be called by one entity
     * The release signal is sent when
     * - the timeline function as returned
     * - and all running entities are released
     */
    async releaseSignal() {
        if (!this.released) {
            return new Promise(resolve => this.releaseCb = resolve);
        }
        return;
    }

    private setTlFunctionComplete() {
        // console.log(this.name, ": tl function complete", this.currentTime);
        this.tlFunctionComplete = true;
        ASYNC_COUNTER++;
        this.checkState();
    }

    private checkState() {
        // log(this.name, ":checkState @", this.currentTime, this.released, this.done, this.tlFunctionComplete, this.lastTargetForward);
        // check if the timeline has released or completed
        if (this.released && this.done) return;
        if (this.tlFunctionComplete && this.lastTargetForward) {
            //console.log(this.name, ": check state");
            let ae = this.rList, allReleased = true, allDone = false;
            let count = 0;
            while (ae) {
                // log(this.name, ": check ae: ", ae.name, " released: ", ae.released)
                count++
                if (!ae.released) {
                    allReleased = false;
                }
                ae = ae.nextEntity;
            }
            // log(this.name, ": check ", count, allReleased, allDone)
            if (allReleased) {
                // log(this.name, ": RELEASED", (this.releaseCb !== undefined))
                this.released = true;
                if (this.releaseCb) {
                    this.releaseCb(); // will send release Signal
                    this.releaseCb = undefined;
                }
            }
            if (count === 0) {
                // log(this.name, ": DONE")
                this.done = true;
                allDone = true;
            }
            if (this.parent && allReleased && this.done) {
                this.parent.removeEntity(this);
            }
            if (this.parent && (allReleased || allDone)) {
                this.parent.checkState();
            }
        }
    }

    async move(timeTarget: number): Promise<number> {
        this.moveTarget = timeTarget;

        let currentTime = this.currentTime;
        if (timeTarget === currentTime) return currentTime;

        let forward = (timeTarget > currentTime), nextTarget: number;

        // principle: display first all marker frames, then last frame is calculated between markers
        // key steps
        // 1. find next time where frames need to be displayed
        // 2. display frame
        // 3. exhaust the async pipe (that may generate new items in the running entity list)
        // 4. repeat
        while (currentTime !== this.moveTarget) {
            // step #1
            if (currentTime < 0) {
                if (this.startTime < 0) {
                    this.startTime = 0;
                }
                nextTarget = this.startTime;
            } else {
                if (forward !== this.lastTargetForward) {
                    // we changed direction: we may have to re-display the current frame if we are on a marker
                    // log(">> display last frame")
                    let m = this.getMarker(currentTime);
                    if (m) {
                        this.displayFrame(currentTime, timeTarget, forward);
                        await exhaustAsyncPipe();
                    }
                }

                nextTarget = this.getNextMarkerPosition(currentTime, forward);
                log("move: nextTarget @", currentTime, "->", nextTarget, ">>", timeTarget, "forward: ", forward);
                if (nextTarget < 0 || nextTarget === currentTime) {
                    // no marker found : we reached the end of the time line
                    this.moveTarget = currentTime;
                    this.endTime = currentTime;
                    return currentTime;
                } else {
                    if (forward) {
                        if (nextTarget > timeTarget) {
                            nextTarget = timeTarget;
                        }
                    } else {
                        if (nextTarget < timeTarget) {
                            nextTarget = timeTarget;
                        }
                    }
                }
            }
            // step #2
            this.displayFrame(nextTarget, timeTarget, forward);

            // step #3
            await exhaustAsyncPipe();

            // step #4
            currentTime = this.currentTime; // has been changed by displayFrame()
        }
        return this.currentTime;
    }

    /**
     * Display the frame at the given time position
     * @param time time position of the frame
     * @param targetTime time of the target frame
     * @param forward true if the animation is going forward (i.e. time is increasing)
     */
    displayFrame(time: number, targetTime: number, forward: boolean) {
        // log(this.name, ":display @", time, "target:", targetTime, "forward:", forward);
        this.currentTime = time;
        this.lastTargetTime = targetTime;
        this.lastTargetForward = forward;
        if (!this.tlFunctionCalled) {
            this.tlFunctionCalled = true;
            // init the instructions - this will indirectly call addEntity / removeEntity
            let r: any | Promise<any> = this.tlFunction(this);
            if (r && r.then) {
                r.then(() => {
                    this.setTlFunctionComplete();
                });
            } else {
                this.setTlFunctionComplete();
            }
        } else {
            let m = this.getMarker(time), startAes: AnimEntity[] | undefined, endAes: AnimEntity[] | undefined;
            if (m) {
                // console.log("marker @", time, m);
                startAes = forward ? m.startEntities : m.endEntities;
                endAes = forward ? m.endEntities : m.startEntities;
            }

            // display frames for each running entity
            let ae = this.rList;
            while (ae) {
                ae.skipRendering = this.skipRendering;
                ae.displayFrame(time, targetTime, forward);
                ae = ae.nextEntity;
            }

            // add all new entities according to marker info
            if (startAes) {
                let idx = startAes.length, ae: AnimEntity;
                while (idx--) {
                    ae = startAes[idx];
                    if (!ae.isRunning) {
                        this.addEntity(ae); // will trigger a display frame
                    }
                }
            }

            // remove all done entities according to marker info
            if (endAes) {
                let idx = endAes.length, ae: AnimEntity;
                while (idx--) {
                    ae = endAes[idx];
                    if (ae.isRunning) {
                        this.removeEntity(ae);
                    }
                }
            }
        }
        this.checkState();
    }

    getNextMarkerPosition(time: number, forward: boolean): number {
        // return the time position of the next marker in a given position
        // if no marker is found, -1 is returned

        // principle:
        // - find next in the running entity list
        // - if not found, look into own marker (will be redundant if already found in rList)
        let n = forward ? MAX_TIME : -1, n2 = -1, ae = this.rList, found = false;
        while (ae) {
            n2 = ae.getNextMarkerPosition(time, forward);

            log(this.name, ": ae.getNextMarkerPosition for ", ae.name, " - time: ", time, " -> ", n2);
            if (n2 > -1) {
                if (forward) {
                    // keep the min of the markers
                    if (time < n2 && n2 < n) {
                        n = n2;
                        found = true;
                    }
                } else {
                    // keep the max of the markers
                    if (time > n2 && n2 > n) {
                        n = n2;
                        found = true;
                    }
                }
            }

            // if (this.name === "iteration#1") {
            //     log("ae", ae.name, ae.nextEntity? ae.nextEntity.name : "null")
            // }
            ae = ae.nextEntity;
        }

        // look in the marker list
        let m = this.currentMarker;
        while (m) {
            if (forward) {
                if (m.time > time) {
                    if (found && n === m.time) {
                        this.currentMarker = m;
                        m = undefined;
                    } else if (m.time < n) {
                        // this marker is better positioned than n
                        n = m.time;
                        found = true;
                        m = m.prev; // see if prev is not closer to current time
                    } else {
                        m = undefined;
                    }
                } else {
                    m = m.next;
                }
            } else {
                if (m.time < time) {
                    if (found && n === m.time) {
                        this.currentMarker = m;
                        m = undefined;
                    } else if (m.time > n) {
                        // this marker is better positioned than n
                        n = m.time;
                        found = true;
                        m = m.next; // see if next is not closer to current time
                    } else {
                        m = undefined;
                    }
                } else {
                    m = m.prev;
                }
            }
        }

        // log(this.name, ": getNextMarkerPosition -> result = ", found ? n : -1)
        return found ? n : -1;
    }

    addEntity(ae: AnimEntity) {
        // this function is called through the calls done in the timeline function
        // log(this.name, ": addEntity", ae.name, " @", this.currentTime);
        ASYNC_COUNTER++;
        if (!ae.startRegistered) {
            ae.init(this.currentTime);
            let m = this.createMarker(this.currentTime);
            if (!m.startEntities) {
                m.startEntities = [ae];
            } else {
                m.startEntities.push(ae);
            }
            ae.startRegistered = true;
        }

        if (!this.rList) {
            this.rList = ae;
            ae.nextEntity = null;
        } else {
            // insert new entity first
            ae.nextEntity = this.rList;
            this.rList = ae;
        }
        ae.isRunning = true;
        ae.skipRendering = this.skipRendering;
        ae.displayFrame(this.currentTime, this.lastTargetTime, this.lastTargetForward);
    }

    removeEntity(ae: AnimEntity) {
        // log(this.name, ": removeEntity", ae.name, " @", this.currentTime);
        ASYNC_COUNTER++;
        let e = this.rList;
        if (!ae.endRegistered && this.lastTargetForward) {
            // only register the end in forward mode
            let m = this.createMarker(this.currentTime);
            if (!m.endEntities) {
                m.endEntities = [ae];
            } else {
                m.endEntities.push(ae);
            }
            ae.endRegistered = true;
        }
        if (e === ae) {
            this.rList = ae.nextEntity;
        } else {
            while (e) {
                if (e.nextEntity === ae) {
                    e.nextEntity = ae.nextEntity;
                    e = null;
                } else {
                    e = e.nextEntity;
                }
            }
        }
        ae.isRunning = false;
    }

    /**
     * Retrieve the marker associated to the given time position
     * return null if no marker is defined for this time
     * @param time 
     */
    getMarker(time: number): AnimMarker | undefined {
        let m = this.currentMarker;
        if (!m) return undefined;
        let forward = time >= m.time;
        while (m) {
            if (m.time === time) return m;
            // Warning: this part can be fragile (works only if currentMarker is well positioned)
            if (forward && (m.time <= time)) {
                m = m.next;
            } else if (!forward && (m.time >= time)) {
                m = m.prev;
            } else {
                m = undefined;
            }
        }
        return undefined;
    }

    /**
     * Retrieve an existing Marker or create a new one if none exists
     * @param time the time position where the marker should be ste
     * @param start [optional] Marker from which to start the search (used for recursion)
     */
    createMarker(time: number, start?: AnimMarker): AnimMarker {
        if (!this.firstMarker) {
            return this.firstMarker = this.lastMarker = this.currentMarker = createMarker(time);
        } else {
            let cm = start || this.currentMarker!, m: AnimMarker | undefined;
            if (cm.time === time) {
                return cm;
            }
            if (time > cm.time) {
                // look next
                m = cm.next;
                if (m && m.time <= time) {
                    return this.createMarker(time, m);
                }
                // a new marker needs to be created
                m = cm.next = createMarker(time, cm, cm.next);
                if (this.lastMarker === cm) {
                    this.lastMarker = m;
                }
            } else {
                // look back
                m = cm.prev;
                if (m && m.time >= time) {
                    return this.createMarker(time, m);
                }
                // a new marker needs to be created
                m = cm.prev = createMarker(time, cm.prev, cm);
                if (this.firstMarker === cm) {
                    this.firstMarker = m;
                }
            }
            this.currentMarker = m;
            return m;
        }
    }

    // this method can be overridden for specific contexts
    select(selector: Selector, scope?: SelectorContext): StyleElement | null {
        if (typeof selector === "string") {
            scope = scope || this.selectorCtxt;
            if (scope) {
                return scope!.querySelector(selector);
            }
        } else if (selector["style"]) {
            return selector as StyleElement;
        }
        return null;
    }

    selectAll(selector: Selector, scope?: SelectorContext): StyleElement[] | null {
        if (typeof selector === "string") {
            scope = scope || this.selectorCtxt;
            if (scope) {
                return scope!.querySelectorAll(selector);
            }
        } else if (selector["style"]) {
            return [selector] as StyleElement[];
        } else if (Array.isArray(selector)) {
            let r = [], len = selector.length;
            for (let i = 0; len > i; i++) {
                let r2 = this.selectAll(selector[i], scope);
                if (r2) {
                    r = r.concat(<any>r2);
                }
            }
            return r;
        }
        return null;
    }

    random(min: number, max: number): number {
        return min + Math.trunc(Math.random() * (max + 1 - min));
    }

    defaults(params: ControlParams): void {
        if (params) {
            let newSettings = Object.create(this.settings);
            for (let k in params) {
                if (params.hasOwnProperty(k)) {
                    newSettings[k] = params[k];
                }
            }
            this.settings = newSettings;
        }
    }

    async animate(params: AnimateParams): Promise<any> {
        // read all control args
        let d = this.settings,
            target = parseValue("target", params, d) as Selector,
            easing = parseValue("easing", params, d) as Function,
            speed = parseValue("speed", params, d) as number,
            duration = convertDuration(parseValue("duration", params, d), speed), // convertDuration
            delay = convertDuration(parseValue("delay", params, d), speed),
            release = convertDuration(parseValue("release", params, d), speed),
            elasticity = parseValue("elasticity", params, d) as number;

        // identify target
        let targetElt = this.select(target);
        if (!targetElt) {
            return console.log('[anim] invalid target selector: ' + target);
        }

        // identify css properties to animate and create a tween for each of them
        let tween: Tween | null = null;
        for (let p in params) {
            if (!defaultSettings.hasOwnProperty(p) && p !== 'target') {
                let propName: string = p, val = params[p], propFrom: any, propTo: any;
                if (Array.isArray(val)) {
                    if (val.length !== 2) {
                        console.log('[anim] invalid property value: ' + val);
                        continue;
                    }
                    propFrom = val[0];
                    propTo = val[1];
                } else {
                    propFrom = undefined;
                    propTo = val
                }
                // create a tween for each prop to animate
                tween = new Tween(targetElt, propName, propFrom, propTo, duration, easing, delay, release);
                tween.attach(this);
            }
        }
        if (tween) {
            // return a promise associated to the last tween
            return new Promise((resolve) => {
                tween!.releaseCb = resolve;
            });
        }
    }

    async delay(timeMs: number) {
        let d = convertDuration(timeMs, this.settings.speed!);
        if (d > 0) {
            let delay = new Delay(d);
            delay.attach(this);
            return new Promise((resolve) => {
                delay.releaseCb = resolve;
            });
        }
        return;
    }

    async sequence(...blocks: Instructions[]): Promise<any> {
        let len = blocks.length;
        if (!len) return;
        let main = new TimeLine("sequence#" + ++AE_COUNT, async function (a) {
            for (let i = 0; len > i; i++) {
                let ac = new TimeLine("block#" + i, blocks[i]);
                ac.attach(a as TimeLine);
                await ac.releaseSignal();
                ASYNC_COUNTER++;
            }
        });
        main.attach(this);
        await main.releaseSignal();
        ASYNC_COUNTER++;
    }

    async parallelize(...tracks: ((a: Anim) => void)[]): Promise<any> {
        let len = tracks.length;
        if (!len) return;
        let main = new TimeLine("tracks#" + ++AE_COUNT, function (a) {
            for (let i = 0; len > i; i++) {
                (new TimeLine("track#" + i, tracks[i])).attach(a as TimeLine);
            }
        });
        main.attach(this);
        await main.releaseSignal();
        ASYNC_COUNTER++;
    }

    async iterate(targetsOrParams: Selector | IterationParams, instructions: (a: Anim, idx: number, total: number, e: StyleElement) => void | Promise<any>) {
        let targets: Selector, inSequence = false
        if ((<any>targetsOrParams).targets !== undefined) {
            targets = (targetsOrParams as IterationParams).targets;
            inSequence = (targetsOrParams as IterationParams).sequence === true
        } else {
            targets = targetsOrParams as Selector;
        }

        let elements = this.selectAll(targets);
        if (!elements) return;
        let len = elements.length;
        if (len) {
            let main = new TimeLine("iteration#" + ++AE_COUNT, async function (a1: Anim) {
                for (let i = 0; len > i; i++) {
                    let ac = new TimeLine("item#" + i, async function (a2) {
                        let e = elements![i];
                        a2.defaults({ target: e });
                        await instructions(a2, i, len, e);
                    });
                    ac.attach(a1 as TimeLine);
                    if (inSequence) {
                        await ac.releaseSignal();
                        // log(">> release received: ", i);
                        ASYNC_COUNTER++;
                    }
                }
            });
            main.attach(this);
            await main.releaseSignal();
            ASYNC_COUNTER++;
        }
    }

    async repeat(times: number, instructions: ((a: Anim, loopCount: number) => void)) {
        if (times > 0) {
            let main = new TimeLine("loop#" + ++AE_COUNT, async function (a) {
                for (let i = 0; times > i; i++) {
                    let ac = new TimeLine("block#" + i, async a2 => {
                        await instructions(a2, i);
                    });
                    ac.attach(a as TimeLine)
                    await ac.releaseSignal();
                    ASYNC_COUNTER++;
                }
            });
            main.attach(this);
            await main.releaseSignal();
            ASYNC_COUNTER++;
        }
    }
}

function createMarker(time: number, prev?: AnimMarker, next?: AnimMarker): AnimMarker {
    return {
        prev: prev,
        next: next,
        time: time,
        startEntities: undefined,
        endEntities: undefined
    }
}

function parseValue(name, params, defaults) {
    let v = params[name];
    return (v === undefined) ? defaults[name] : v;
}

function roundNbr(v, decimalLevel = 10) {
    // todo: prevent sub-pixel positioning?
    return Math.trunc(v * decimalLevel) / decimalLevel;
}

class Tween implements AnimEntity {
    name = "animate";
    nextEntity: AnimEntity | null;
    isRunning = false;
    startRegistered = false;
    endRegistered = false;
    releaseCb: (() => void) | null = null;
    delayOnly = false;    // true if this tween is only used for a delay
    parent: AnimContainer | undefined;
    skipRendering = false;

    currentTime = -1;     // time at which the last frame has been displayed

    startTime = -1;
    delayTime = -1;
    releaseTime = -1;
    doneTime = -1;
    endTime = -1;

    released = false;
    done = false;

    isNumber = false;
    unit = "";

    constructor(public targetElt: StyleElement | null, public propName: string, public propFrom, public propTo, public duration: number, public easing, public delay: number, public release: number) {
        // todo normalize from / to, support colors, etc.
        this.name = "tween#" + ++AE_COUNT;
        this.isNumber = true;
        this.unit = "px";
    }

    attach(parent: AnimContainer) {
        if (!this.parent) {
            this.parent = parent;
            this.parent.addEntity(this);
        }
    }

    init(startTime: number) {
        this.startTime = startTime;
        if (this.delay < 0) {
            this.delay = 0;
        }
        this.delayTime = startTime + this.delay;
        let doneTime = this.delayTime + this.duration; // doneTime occurs when movement finishes - but this is not necessarily the end of the animation
        this.doneTime = doneTime;
        this.releaseTime = doneTime + this.release;
        if (this.releaseTime < this.delayTime) {
            this.release = -this.duration;
            this.releaseTime = this.delayTime; // release cannot be bigger than duration
        }
        this.endTime = doneTime;
        if (this.releaseTime > this.endTime) {
            this.endTime = this.releaseTime;
        }
    }

    displayFrame(time: number, targetTime: number, forward: boolean) {
        // log(this.name, ": display frame", time, targetTime, forward)
        if (this.startTime <= time && time <= this.endTime) {
            this.currentTime = time;
            if (!this.skipRendering && !this.delayOnly) {
                let targetFrame = time === targetTime;
                if ((targetFrame && this.delayTime <= time && time <= this.doneTime)) {
                    this.setValue(time - this.delayTime);
                } else if (!targetFrame) {
                    if (forward && targetTime >= this.doneTime && time === this.doneTime) {
                        this.setValue(time - this.delayTime);
                    } else if (!forward && targetTime <= this.delayTime && time === this.delayTime) {
                        this.setValue(0);
                    }
                }
            }
            if (time === this.doneTime) {
                this.done = true;
            }
            if (this.parent) {
                if (forward && time === this.endTime) {
                    this.parent.removeEntity(this);
                } else if (!forward && time === this.startTime) {
                    this.parent.removeEntity(this);
                }
            }

            if (this.releaseCb && time === this.releaseTime) {
                this.released = true;
                this.releaseCb();
                this.releaseCb = null;
            }
        }
    }

    setValue(elapsed: number) {
        let d = this.duration, progression = d === 0 ? 1 : elapsed / d;
        if (this.targetElt && this.isNumber) {
            // todo: 2nd easing parameter = elasticity
            let v = roundNbr(this.propFrom + (this.propTo - this.propFrom) * this.easing(progression, 100)) + this.unit;
            // log(">> style." + this.propName + "=" + v);
            // log(">>", this.propFrom, this.propTo, "elapsed=" + elapsed, "delayTime=" + this.delayTime, "d=" + d, "progression=" + progression);
            this.targetElt.style[this.propName] = v;
        }
    }

    getNextMarkerPosition(time: number, forward: boolean): number {
        // console.log(this.name, ": next frame pos", timeTarget);
        // tween has 2 or 3 markers
        // - if release has already been triggered (i.e. tween doesn't run for the 1st time):
        //         delayTime <= doneTime
        // - if first time, releaseTime needs to be included, and we have 2 options:
        //         delayTime <= releaseTime <= doneTime (release<=0)
        //     or  delayTime <= doneTime <= releaseTime (release>0)
        if (forward) {
            if (time < this.delayTime) return this.delayTime;

            if (this.releaseCb) {
                // 1st time
                // console.log("here", this.release, this.doneTime)
                if (this.release <= 0) {
                    if (time < this.releaseTime) return this.releaseTime;
                    if (time < this.doneTime) return this.doneTime;
                    return -1;
                } else {
                    if (time < this.doneTime) return this.doneTime;
                    if (time < this.releaseTime) return this.releaseTime;
                    return -1;
                }
            } else {
                if (time < this.doneTime) return this.doneTime;
                return -1;
            }
        } else {
            // backward - nb: releaseCb doesn't need to be checked in this case
            if (time > this.doneTime) return this.doneTime;
            if (time > this.delayTime) return this.delayTime;
            return -1;
        }
    }
}

class Delay extends Tween {
    constructor(duration: number) {
        super(null, "", 0, 0, 0, IDENTITY, duration, 0);
        this.delayOnly = true;
    }
}

const LENGTH_UNPROCESSED = -2, LENGTH_INFINITE = -1;
let PLAY_COUNT = 0;

function nextTimeTick(t1: number, fwd: boolean) {
    if (t1 < 0) return 0;
    let t2 = fwd ? t1 + FRAME_MS : t1 - FRAME_MS;
    return t2 < 0 ? 0 : t2;
}

export class Player implements AnimPlayer {
    maxDuration: number = MAX_TL_DURATION_MS;
    protected timeLine: TimeLine;
    protected currentTick = -1;
    protected length = LENGTH_UNPROCESSED;
    private playId = 0;

    constructor(public animFunction: (a: Anim, ...args: any[]) => any) {
        this.timeLine = new TimeLine("root", animFunction);
        if (typeof document !== "undefined") {
            this.timeLine.selectorCtxt = document as any;
        }
    }

    async play(args?: PlayArguments): Promise<number> {
        let onupdate: ((time: number) => void) | undefined, p = this, fwd = true, raf: ((callback: (time: number) => void) => void) | undefined;
        if (args) {
            onupdate = args.onupdate;
            raf = args.raf;
            fwd = (args.forward !== undefined) ? !!args.forward : true;
        }
        raf = raf || requestAnimationFrame;

        return new Promise<number>((resolve) => {
            let tl = this.timeLine, playId = p.playId = ++PLAY_COUNT;
            async function paint() {
                let t1 = tl.currentTime, t2 = nextTimeTick(tl.currentTime, fwd)
                if (p.playId !== playId) {
                    return resolve(t1); // play was stopped or restarted in the meantime
                }
                await tl.move(t2)
                let ct = tl.currentTime;
                if (onupdate && t1 !== ct) {
                    onupdate(ct);
                }
                if ((fwd && tl.endTime === ct) || !fwd && ct === 0) {
                    resolve(ct);
                    p.playId = 0;
                } else {
                    raf!(paint);
                }
            }
            paint();
        });
    }

    pause() {
        this.playId = 0;
    }

    async stop(): Promise<number> {
        this.playId = 0;
        return this.timeLine.move(0);
    }

    async move(timeTarget) {
        return this.timeLine.move(timeTarget);
    }

    async duration(): Promise<number> {
        // TODO support infinite duration
        if (this.length === LENGTH_UNPROCESSED) {
            let pos = this.position;
            this.timeLine.skipRendering = true;
            await this.runTicker();
            this.length = this.timeLine.currentTime;
            await this.move(pos); // move back to original position
            this.timeLine.skipRendering = false;
        }
        return this.length;
    }

    get position(): number {
        let t = this.timeLine.currentTime;
        return t < 0 ? 0 : t;
    }

    get isPlaying(): boolean {
        return this.playId !== 0;
    }

    private async runTicker() {
        let count = 0, tl = this.timeLine, max = Math.trunc(this.maxDuration / FRAME_MS);
        while (count < max) {
            count++;
            this.currentTick++;
            await tl.move(this.currentTick * FRAME_MS);
            if (tl.endTime === tl.currentTime) {
                return; // done
            }
        }
    }
}


