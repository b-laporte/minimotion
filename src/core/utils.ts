import { TweenType, RelativeOperator } from './types';

let LOG_ACTIVE = false;

export function log(...args: any[]) {
    if (LOG_ACTIVE) {
        console.log.apply(console, args);
    }
}

export function activateLogs() {
    LOG_ACTIVE = true;
}

export function deactivateLogs() {
    LOG_ACTIVE = false;
}

export function parseValue(name, params, defaults) {
    let v = params[name];
    return (v === undefined) ? defaults[name] : v;
}

// --------------------------------------------------------------------------------------------------------------------
// utilities from http://animejs.com

const validTransforms = { translateX: 1, translateY: 1, translateZ: 1, rotate: 1, rotateX: 1, rotateY: 1, rotateZ: 1, scale: 1, scaleX: 1, scaleY: 1, scaleZ: 1, skewX: 1, skewY: 1, perspective: 1 };

const is = {
    // arr: a => Array.isArray(a),
    // obj: a => stringContains(Object.prototype.toString.call(a), 'Object'),
    // pth: a => is.obj(a) && a.hasOwnProperty('totalLength'), // is path
    svg: a => a.ownerSVGElement !== undefined, // instanceof SVGElement,
    dom: a => a.nodeType || is.svg(a),
    // str: a => typeof a === 'string',
    // fnc: a => typeof a === 'function',
    // und: a => typeof a === 'undefined',
    // col: a => (is.hex(a) || is.rgb(a) || is.hsl(a)), // is color
    // hex: a => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a), // is #xxxxxx color
    // rgb: a => /^rgb/.test(a), // is rgb color
    // hsl: a => /^hsl/.test(a) // is hsl color
}

/**
 * Transform js prop names into css propnames (e.g. "borderColor" into "border-color")
 * @param str 
 */
function stringToHyphens(str: string) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Identify the type of animation (transform vs attribute vs css style)
 * @param el 
 * @param propName 
 */
export function getAnimationType(el: any, propName: string): TweenType {
    if (is.dom(el)) {
        if (validTransforms.hasOwnProperty(propName)) return 'transform';
        if ((el.getAttribute(propName) || (is.svg(el) && el[propName]))) return 'attribute';
        if (propName !== 'transform') return 'css';
    }
    return 'invalid';
}

export let dom = {
    /**
     * Read the dom element to access the computed CSS value
     * @param el 
     * @param prop 
     */
    getCSSValue(el, prop: string) {
        if (prop in el.style) {
            return getComputedStyle(el).getPropertyValue(stringToHyphens(prop)) || '0';
        }
        return '';
    }
}
