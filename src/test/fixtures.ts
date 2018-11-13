import { TimeLine, Player } from './../core/anim';
import { StyleElement, SelectorContext, Anim } from "../core/types";


let CURRENT_TICK = 0;
const MAX_ITERATION = 100, MAX_ASYNC = 100;
let _logs: string[] = [];

export function reset() {
    _logs = [];
    CURRENT_TICK = 0;
}

export function logs() {
    return _logs;
}

export function lastTick() {
    return CURRENT_TICK;
}

export function incrementTick() {
    CURRENT_TICK++;
}

function traceProp(eltId, propName, value) {
    // console.log(`${CURRENT_TICK}: #${eltId}.${propName} = ${value}`)
    _logs.push(`${CURRENT_TICK}: #${eltId}.${propName} = ${value};`)
}

class TestStyle {
    _top: 0;
    _left: 0;

    constructor(public id: string) { }

    set top(v) {
        this._top = v;
        traceProp(this.id, "top", this._top);
    }

    set left(v) {
        this._left = v;
        traceProp(this.id, "left", this._left);
    }
}

export class TestElement implements StyleElement {
    style: Object;

    constructor(public id: string, public className = "") {
        this.style = new TestStyle(id);
    }
}

class TestSelectorCtxt implements SelectorContext {
    constructor(public elements: TestElement[]) { }

    querySelector(selector: string): StyleElement | null {
        let elts = this.elements, idx = elts.length;
        while (idx--) {
            if (selector === "#" + elts[idx].id) {
                return elts[idx];
            }
        }
        return null;
    }

    querySelectorAll(selector: string): StyleElement[] | null {
        let elts = this.elements, idx = elts.length, res: StyleElement[] = [];
        while (idx--) {
            if (selector === elts[idx].className) {
                res.push(elts[idx]);
            }
        }
        return res.length ? res.reverse() : null;
    }
}

export function animCtxtXYZ() {
    let x = new TestElement("x", "colItem"), y = new TestElement("y", "colItem"), z = new TestElement("z", "colItem");
    return [x, y, z];
}

export class TestPlayer extends Player {
    constructor(public elements: TestElement[], public animFunction: (a: Anim, ...args: any[]) => any) {
        super(animFunction);
        this.timeLine.selectorCtxt = new TestSelectorCtxt(elements);
    }

    async play(args?):Promise<number> {
        return new Promise<number>((resolve) => {
            CURRENT_TICK = -1;
            runTicker(this.timeLine, resolve);
        });
    }
}

export class TestPlayer2 extends Player {
    constructor(public elements: TestElement[], public animFunction: (a: Anim, ...args: any[]) => any) {
        super(animFunction);
        this.timeLine.selectorCtxt = new TestSelectorCtxt(elements);
    }
}

async function runTicker(tl: TimeLine, resolve: Function) {
    while (CURRENT_TICK < MAX_ITERATION) {
        incrementTick();
        await tl.move(CURRENT_TICK * 16);

        if (tl.endTime === tl.currentTime) {
            // done
            resolve(tl.endTime);
            return;
        }
        if (CURRENT_TICK === MAX_ITERATION) {
            throw new Error("Max iteration reached");
        }
    }
}
