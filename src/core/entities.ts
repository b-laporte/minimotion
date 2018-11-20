import { ControlParams, AnimEntity, AnimContainer, StyleElement, Anim, PlayParams, TweenType, RelativeOperator } from "./types";
import { parseValue, log, getAnimationType, dom, parseColor, activateLogs, deactivateLogs } from './utils';

const RX_NUMERIC_PROP = /^(\*=|\+=|-=)?([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/,
    RX_DEFAULT_PX_PROPS = /(radius|width|height|top|left)$/i;

const trunc = Math.trunc, ceil = Math.ceil;
let AE_COUNT = 0;

function interpolate(from: number, to: number, easing: number, decimalLevel: number) {
    return trunc((from + (to - from) * easing) * decimalLevel) / decimalLevel;
}

abstract class TimelineEntity implements AnimEntity {
    name: string;
    nextEntity: AnimEntity | null;
    isRunning = false;
    startRegistered = false;
    endRegistered = false;
    skipRendering = false;
    released = false;
    done = false;
    parent: AnimContainer | undefined;
    delay = 0;
    release = 0;
    duration = -1;
    startTime = -1;
    delayTime = -1;
    releaseTime = -1;
    doneTime = -1;
    endTime = -1;
    releaseCb: (() => void) | null = null;

    constructor(name) {
        this.name = name;
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
        if (this.duration >= 0) {
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
    }

    checkDoneAndRelease(time: number, forward: boolean) {
        // log(this.name, "checkDoneAndRelease")
        if (time === this.doneTime) {
            this.done = true;
        }
        if (this.done && this.parent) {
            if (forward && time === this.endTime) {
                this.parent.removeEntity(this);
            } else if (!forward && time === this.startTime) {
                this.parent.removeEntity(this);
            }
        }
        if (time === this.releaseTime) {
            this.released = true;
            if (this.releaseCb) {
                this.releaseCb();
                this.releaseCb = null;
            }
        }
    }

    getNextMarkerPosition(time: number, forward: boolean): number {
        // log(this.name, ": next frame pos", time);
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

    displayFrame(time: number, targetTime: number, forward: boolean) {
        this.checkDoneAndRelease(time, forward);
    }
}

export function createTweens(targetElt: StyleElement | null, params, settings, parent, duration: number, easing: Function, elasticity: number, delay: number, release: number) {
    let tween: Tween | null = null;
    for (let p in params) {
        if (settings[p] === undefined && p !== 'target') {
            // TODO share init results across all tweens of a same family
            let twn = new Tween(targetElt, p, params[p], duration, easing, elasticity, delay, release);
            if (twn.isValid) {
                tween = twn;
                tween.attach(parent);
            }
        }
    }
    return tween;
}

export class Tween extends TimelineEntity {
    isValid = true;
    isNumeric = false; // if false, it is a color
    relOp: RelativeOperator = '';
    unit = "";
    propFrom: any;
    propTo: any;
    type: TweenType;
    roundLevel = 10;

    constructor(public targetElt: StyleElement | null, public propName: string, propValue, public duration: number, public easing, public elasticity: number, delay: number, release: number) {
        // todo normalize from / to, support colors, etc.
        super("tween#" + ++AE_COUNT);
        this.delay = delay;
        this.release = release;
        let r = this.parsePropValue(propValue);
        if (r !== 0) {
            console.error("[animate] invalid syntax (Error " + r + ")");
            this.isValid = false;
        }
    }

    // return 0 if ok
    parsePropValue(propValue): number {
        // - define tween type: style, attribute or transform
        // - get to value & unit, determine if relative (i.e. starts with "+" or "-")
        // - get from value (unit should be the same as to)
        // - identify value type (dimension, color, unit-less)
        let target = this.targetElt,
            propName = this.propName,
            type = this.type = getAnimationType(target, propName);
        if (type === 'invalid') return 100;

        let propFrom: any, propTo: any;
        if (Array.isArray(propValue)) {
            if (propValue.length !== 2) return 101;
            propFrom = '' + propValue[0];
            propTo = '' + propValue[1];
        } else {
            propFrom = undefined;
            propTo = '' + propValue;
        }
        if (!propTo) return 102;

        let split = RX_NUMERIC_PROP.exec(propTo);
        if (split) {
            // propTo is a numeric prop - e.g. '20px' or '+=300.3em' or '0.3'
            this.isNumeric = true;
            this.relOp = split[1] as any;
            this.propTo = parseFloat(split[2]);
            this.unit = split[3] || '';

            let propFromIsDom = false;
            if (!propFrom) {
                // read from dom
                propFromIsDom = true;
                propFrom = dom.getValue(target, propName, type);
                if (propFrom === null) return 103;
            }
            // check consistency
            let split2 = RX_NUMERIC_PROP.exec(propFrom);
            if (!split2) return 200;
            if (split2[1]) return 201; // cannot be relative
            let fromUnit = split2[3] || '';
            if (!propFromIsDom && this.unit && fromUnit && fromUnit !== this.unit) return 202; // units have to be the same
            this.unit = this.unit || fromUnit; // if unit is not defined in to value, we use from value
            this.propFrom = parseFloat(split2[2]);

            if (!this.unit) {
                // set default unit for common properties
                if (this.type === 'css') {
                    if (this.propName.match(RX_DEFAULT_PX_PROPS)) this.unit = 'px';
                }
            }

            switch (this.relOp) {
                case '+=': { this.propTo += this.propFrom; break; }
                case '-=': { this.propTo = this.propFrom - this.propTo; break; }
                case '*=': { this.propTo *= this.propFrom; break; }
            }
        } else {
            // not numeric - may be a color?
            let c = parseColor(propTo);
            if (!c) return 300; // invalid value
            this.propTo = c;
            if (!propFrom) {
                c = parseColor(dom.getValue(target, propName, type)) || [0, 0, 0, 1];
            } else {
                c = parseColor(propFrom);
                if (!c) return 301; // invalid from color value
            }
            this.propFrom = c;
        }

        if (!this.unit) {
            this.roundLevel = 100; // unit-less properties should be rounded with 2 decimals by default (e.g. opacity)
        }
        return 0; // ok
    }

    displayFrame(time: number, targetTime: number, forward: boolean) {
        // log(this.name, ": display frame", time, targetTime, forward)
        if (this.delayTime <= time && time <= this.endTime) {
            if (!this.skipRendering) {
                let targetFrame = time === targetTime;
                if ((targetFrame && this.delayTime <= time && time <= this.doneTime)) {
                    this.setProgression(time - this.delayTime);
                } else if (!targetFrame) {
                    if (forward && targetTime >= this.doneTime && time === this.doneTime) {
                        this.setProgression(time - this.delayTime);
                    } else if (!forward && targetTime <= this.delayTime && time === this.delayTime) {
                        this.setProgression(0);
                    }
                }
            }
            this.checkDoneAndRelease(time, forward);
        }
    }

    setProgression(elapsed: number) {
        let tg = this.targetElt;
        if (!tg) return;
        let d = this.duration,
            progression = d === 0 ? 1 : elapsed / d,
            easing = this.easing(progression, this.elasticity),
            from = this.propFrom,
            to = this.propTo,
            value;

        if (this.isNumeric) {
            value = interpolate(from, to, easing, this.roundLevel) + this.unit;
        } else {
            let rgba: number[] = [];
            for (let i = 0; 4 > i; i++) {
                rgba.push(interpolate(from[i], to[i], easing, i == 3 ? 100 : 1));
            }
            value = "rgba(" + rgba.join(", ") + ")";
        }
        dom.setValue(tg, this.propName, this.type, value);
    }
}

export class Delay extends TimelineEntity {
    constructor(duration: number) {
        super("delay");
        this.delay = duration;
        this.duration = 0;
    }
}

interface AnimTimeLine {
    doneCb: ((time: number) => void) | undefined;
    move(timeTarget: number, manageAsyncPipe?: boolean): Promise<number>
    getNextMarkerPosition(time: number, forward: boolean): number;
}

export class PlayerEntity extends TimelineEntity {
    timeLine: AnimTimeLine;
    alternate = false;
    times = 1;
    speed = 1;
    backSpeed = 1;
    d1 = -1; // duration of part 1 (= fwd part of a cycle)
    d2 = -1; // duration of part 2 (= backward part of a cycle)

    constructor(timeline: AnimTimeLine, defaults: ControlParams, params?: PlayParams) {
        super("play");
        this.timeLine = timeline;
        if (params) {
            this.times = params.times || 1;
            this.alternate = params.alternate || false;
            this.speed = params.speed || 1;
            this.backSpeed = params.backSpeed || 1;
            this.delay = parseValue("delay", params, defaults) as number;
            this.release = parseValue("release", params, defaults) as number;
        }
        timeline.doneCb = tlDuration => {
            this.d1 = trunc(tlDuration / this.speed);
            this.d2 = this.alternate ? trunc(tlDuration / this.backSpeed) : 0;
            this.duration = (this.d1 + this.d2) * this.times;
            this.init(this.startTime);
        }
    }

    getNextMarkerPosition(time: number, forward: boolean): number {
        let tl = this.timeLine, start = this.delayTime;
        if (this.duration === -1) {
            // first cycle is not finished
            if (time < this.delayTime) return forward ? this.delayTime : -1;

            let m = tl.getNextMarkerPosition((time - start) * this.speed, forward);
            return (m === -1) ? -1 : start + ceil(m / this.speed);
        } else {
            // d1, d2 and duration are defined (cf. doneCb)
            let m1 = super.getNextMarkerPosition(time, forward), m2 = -1;
            if (m1 >= this.delayTime && m1 <= this.doneTime) {
                let d1 = this.d1, cycleLength = trunc(d1 + this.d2),
                    relTime = time - start,
                    t = relTime % cycleLength,
                    nbrOfFullCycles = trunc(relTime / cycleLength);
                if (t < d1) {
                    // forward part
                    m2 = tl.getNextMarkerPosition(t * this.speed, forward);
                    if (m2 !== -1) {
                        m2 = start + nbrOfFullCycles * cycleLength + ceil(m2 / this.speed);
                    }
                } else {
                    // backward part
                    m2 = tl.getNextMarkerPosition((cycleLength - t) * this.backSpeed, !forward);
                    if (m2 !== -1) {
                        m2 = start + nbrOfFullCycles * cycleLength + d1 + ceil((d1 - m2) / this.backSpeed);
                    }
                }
            }
            log("d1", this.d1, "d2", this.d2, "m1=", m1, "m2=", m2, "doneTime", this.doneTime);
            if (m2 === -1) return m1;
            if (m1 === -1) return m2;
            if (forward) {
                return (m2 < m1) ? m2 : m1;
            } else {
                return (m2 > m1) ? m2 : m1;
            }
        }
    }

    displayFrame(time: number, targetTime: number, forward: boolean) {
        if (this.delayTime <= time) {
            let tl = this.timeLine;
            if (this.duration === -1) {
                // first cycle is not finished
                tl.move((time - this.delayTime) * this.speed, false);
            } else {
                // d1, d2 and duration are defined (cf. doneCb)
                if (time >= this.delayTime && time <= this.doneTime) {
                    let cycleLength = trunc(this.d1 + this.d2), t = (time - this.delayTime) % cycleLength;
                    if (t === 0 && time !== this.delayTime) {
                        t = cycleLength;
                    }
                    if (t <= this.d1) {
                        // forward part
                        tl.move(t * this.speed, false);
                    } else {
                        // backward part
                        tl.move((cycleLength - t) * this.backSpeed, false);
                    }
                }
            }
        }
        this.checkDoneAndRelease(time, forward);
    }
}
