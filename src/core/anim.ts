import {
    Anim,
    AnimateParams,
    AnimEntity,
    ControlParams,
    Selector,
    StyleElement,
    SelectorContext,
    Instructions,
    IterationParams,
    AnimMarker,
    AnimTimeLine,
    AnimContainer,
    AnimPlayer,
    PlayArguments,
    PlayParams,
    Target,
    ResolvedTarget,
    isTargetFunction,
} from './types';
import { easeOutElastic } from './easings';
import { log, parseValue } from './utils';
import { Delay, PlayerEntity, createTweens } from './entities';

const FRAME_MS = 16, MAX_TIME = Number.MAX_SAFE_INTEGER, MAX_ASYNC = 100, MAX_TL_DURATION_MS = 600000; // 10mn
let ASYNC_COUNTER = 0; // count the changes that can be triggered by an async call

/**
 * Convert a duration in a number of frames (a frame = 16 ms at speed 1)
 * @param durationMs 
 */
function convertDuration(durationMs: number, speed: number): number {
    return Math.round(durationMs / speed / FRAME_MS) * FRAME_MS;
}

const defaultSettings: ControlParams = {
    easing: easeOutElastic,
    duration: 1000,
    delay: 0,
    release: 0,
    elasticity: .5,
    speed: 1
}

export async function exhaustAsyncPipe() {
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
        if (ASYNC_COUNTER > 1000) {
            // purpose of ASYNC_COUNTER is to track changes, we don't care of the actual value
            ASYNC_COUNTER = 0;
        }
        count++;
    }
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
    tlFunctionArgs: any[] | undefined;
    released = false;
    done = false;                    // true when all child entities have been run
    releaseCb: Function | undefined;
    doneCb: ((time: number) => void) | undefined;

    constructor(public name: string, public tlFunction: (a: Anim) => void, tlFunctionArgs?: any[]) {
        this.tlFunctionArgs = tlFunctionArgs;
    }

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
                if (this.doneCb) {
                    this.doneCb(this.lastTargetTime);
                    this.doneCb = undefined;
                }
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

    async move(timeTarget: number, manageAsyncPipe = true): Promise<number> {
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
            if (manageAsyncPipe) {
                await exhaustAsyncPipe();
            }

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
            let r: any | Promise<any>;
            if (this.tlFunctionArgs) {
                r = this.tlFunction.apply(null, [this].concat(this.tlFunctionArgs));
            } else {
                r = this.tlFunction(this);
            }
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
        if (Math.abs(time - this.currentTime) === FRAME_MS) {
            return time; // no need to dig into markers if we move to next frame
        }
        let n = forward ? MAX_TIME : -1, n2 = -1, ae = this.rList, found = false;
        while (ae) {
            n2 = ae.getNextMarkerPosition(time, forward);

            log(this.name, ": ae.getNextMarkerPosition for ", ae.name, " - time: target:", time, " -> marker:", n2);
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
        log(this.name, ": addEntity", ae.name, " @", this.currentTime);
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
        log(this.name, ": removeEntity", ae.name, "@", this.currentTime);
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
            let r: StyleElement[] = [], len = selector.length;
            for (let i = 0; len > i; i++) {
                let r2 = this.selectAll(selector[i], scope);
                if (r2) {
                    r = r.concat(r2);
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
            target = parseValue("target", params, d) as Target,
            easing = parseValue("easing", params, d) as Function,
            speed = parseValue("speed", params, d) as number,
            duration = convertDuration(parseValue("duration", params, d), speed), // convertDuration
            delay = convertDuration(parseValue("delay", params, d), speed),
            release = convertDuration(parseValue("release", params, d), speed),
            elasticity = parseValue("elasticity", params, d) as number;

        // identify target
        let finalTarget: ResolvedTarget;
        if (isTargetFunction(target)) {
            finalTarget = target;
        } else {
            const targetElement = this.select(target);
            if (targetElement == null) {
                return console.log('[anim] invalid target selector: ' + target);
            }
            finalTarget = targetElement;
        }
    
        // identify properties/attributes to animate and create a tween for each of them
        let tween = createTweens(finalTarget, params, d, this, duration, easing, elasticity, delay, release);
        if (tween) {
            // return a promise associated to the last tween
            return new Promise((resolve) => {
                if (tween!.released) {
                    resolve();
                } else {
                    tween!.releaseCb = resolve;
                }
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

    async group(instructions: ((a: Anim) => void));
    async group(name: string, instructions: ((a: Anim) => void))
    async group(nameOrInstructions: string | ((a: Anim) => void), instructions?: ((a: Anim) => void)) {
        let name = "group";
        if (typeof nameOrInstructions === "string") {
            name = nameOrInstructions;
        } else {
            instructions = nameOrInstructions as ((a: Anim) => void);
        }
        if (instructions) {
            let t = new TimeLine(name, instructions);
            t.attach(this);
            await t.releaseSignal();
            ASYNC_COUNTER++;
        }
    }

    async sequence(...blocks: Instructions[]): Promise<any> {
        let len = blocks.length;
        if (!len) return;
        await this.group("sequence", async function (a) {
            for (let i = 0; len > i; i++) {
                await a.group("block." + i, blocks[i]);
                ASYNC_COUNTER++;
            }
        });
        ASYNC_COUNTER++;
    }

    async parallelize(...tracks: ((a: Anim) => void)[]): Promise<any> {
        let len = tracks.length;
        if (!len) return;
        await this.group("tracks", a => {
            for (let i = 0; len > i; i++) {
                a.group("track." + i, tracks[i]);
            }
        });
        ASYNC_COUNTER++;
    }

    async iterate(targetsOrParams: Selector | IterationParams, instructions: (a: Anim, idx: number, total: number, e: StyleElement) => void | Promise<any>) {
        let targets: Selector, inSequence = false
        if ((targetsOrParams as any).targets !== undefined) {
            targets = (targetsOrParams as IterationParams).targets;
            inSequence = (targetsOrParams as IterationParams).sequence === true
        } else {
            targets = targetsOrParams as Selector;
        }

        let elements = this.selectAll(targets);
        if (!elements) return;
        let len = elements.length;
        if (len) {
            await this.group("iteration", async function (a1: Anim) {
                for (let i = 0; len > i; i++) {
                    let gp = a1.group("item." + i, async function (a2) {
                        let e = elements![i];
                        a2.defaults({ target: e });
                        await instructions(a2, i, len, e);
                    });
                    if (inSequence) {
                        await gp;
                        ASYNC_COUNTER++;
                        // log(">> release received: ", i);
                    }
                }
            });
            ASYNC_COUNTER++;
        }
    }

    async repeat(times: number, instructions: ((a: Anim, loopCount: number) => void)) {
        if (times > 0) {
            await this.group("loop", async function (a) {
                for (let i = 0; times > i; i++) {
                    await a.group("block", async function (a2) {
                        await instructions(a2, i);
                    });
                    ASYNC_COUNTER++;
                }
            });
            ASYNC_COUNTER++;
        }
    }

    async play(instructions: ((a: Anim) => void));
    async play(params: PlayParams, instructions: ((a: Anim) => void))
    async play(paramsOrInstructions: PlayParams | ((a: Anim) => void), instructions?: ((a: Anim) => void)) {
        let params: PlayParams | undefined;
        if (typeof paramsOrInstructions === "object") {
            params = paramsOrInstructions;
        } else {
            instructions = paramsOrInstructions as ((a: Anim) => void);
        }

        if (instructions) {
            let tl = new TimeLine("playTimeline", instructions);
            tl.selectorCtxt = this.selectorCtxt;
            let p = new PlayerEntity(tl, this.settings, params);
            p.attach(this);
            return new Promise((resolve) => {
                p.releaseCb = resolve;
            });
        }
        return;
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

const LENGTH_UNPROCESSED = -2;
let PLAY_COUNT = 0;

function nextTimeTick(t1: number, fwd: boolean, speed: number) {
    if (t1 < 0) return 0;
    let t2 = fwd ? t1 + FRAME_MS * speed : t1 - FRAME_MS * speed;
    return t2 < 0 ? 0 : t2;
}

export class Player implements AnimPlayer {
    maxDuration: number = MAX_TL_DURATION_MS;
    protected timeLine: TimeLine;
    protected currentTick = -1;
    protected length = LENGTH_UNPROCESSED;
    private playId = 0;

    constructor(public animFunction: (a: Anim, ...args: any[]) => any, animFunctionArgs?: any[]) {
        this.timeLine = new TimeLine("root", animFunction, animFunctionArgs);
        if (typeof document !== "undefined") {
            this.timeLine.selectorCtxt = document as any;
        }
    }

    async play(args?: PlayArguments): Promise<number> {
        let onupdate: ((time: number) => void) | undefined, p = this,
            speed = 1,
            fwd = true,
            raf: ((callback: (time: number) => void) => void) | undefined;
        if (args) {
            onupdate = args.onupdate;
            raf = args.raf;
            fwd = (args.forward !== undefined) ? !!args.forward : true;
            speed = args.speed || 1;
        }
        raf = raf || requestAnimationFrame;

        return new Promise<number>((resolve) => {
            let tl = this.timeLine, playId = p.playId = ++PLAY_COUNT;
            async function paint() {
                let t1 = tl.currentTime, t2 = nextTimeTick(tl.currentTime, fwd, speed)
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
