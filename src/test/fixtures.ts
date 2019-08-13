import { TimeLine, Player } from './../core/anim';
import { SelectorContext, Anim } from "../core/types";
import { dom } from '../core/utils';

let CURRENT_TICK = 0;
const MAX_ITERATION = 100;
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
    _logs.push(`${CURRENT_TICK}: #${eltId}.${propName} = ${value};`)
}

// path getCSSValue in Node environment
dom.getCSSValue = function (el, prop: string) {
    if (el.style) {
        return el.style[prop]
    }
    return '';
}

class ElementStyle {
    _top = "0px";
    _left = "0px";
    _opacity = 1;
    _color = "rgb(255, 0, 0)"; // red by default

    constructor(public id: string) { }

    set top(v) {
        this._top = v;
        traceProp(this.id, "top", this._top);
    }
    get top() { return this._top }

    set left(v) {
        this._left = v;
        traceProp(this.id, "left", this._left);
    }
    get left() { return this._left }

    set opacity(v) {
        this._opacity = v;
        traceProp(this.id, "opacity", this._opacity);
    }
    get opacity() { return this._opacity }

    set color(v) {
        this._color = v;
        traceProp(this.id, "color", this._color);
    }
    get color() { return this._color }
}

export class TestElement {
    nodeType = 1;
    style: ElementStyle;

    constructor(public id: string, public className = "") {
        this.style = new ElementStyle(id);
    }

    hasAttribute(name: string) {
        return false;
    }
}

class TestSelectorCtxt implements SelectorContext {
    constructor(public elements: TestElement[]) { }

    querySelector(selector: string): HTMLElement | null {
        const elts = this.elements;
        let idx = elts.length;
        while (idx--) {
            if (selector === "#" + elts[idx].id) {
                return elts[idx] as any as HTMLElement;
            }
        }
        return null;
    }

    querySelectorAll(selector: string): HTMLElement[] | null {
        const elts = this.elements, res: HTMLElement[] = [];
        let idx = elts.length;
        while (idx--) {
            if (selector === "." + elts[idx].className) {
                res.push(elts[idx] as any as HTMLElement);
            }
        }
        return res.length ? res.reverse() : null;
    }
}

export function animCtxtXYZ() {
    const x = new TestElement("x", "colItem"), y = new TestElement("y", "colItem"), z = new TestElement("z", "colItem");
    return [x, y, z];
}

export class TestPlayer extends Player {
    constructor(public elements: TestElement[], public animFunction: (a: Anim, ...args: any[]) => any, animFunctionArgs?: any[]) {
        super(animFunction, animFunctionArgs);
        this.timeLine.selectorCtxt = new TestSelectorCtxt(elements);
    }

    async play(args?): Promise<number> {
        return new Promise<number>((resolve) => {
            CURRENT_TICK = -1;
            runTicker(this.timeLine, resolve);
        });
    }

    get timeline() {
        return this.timeLine;
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
