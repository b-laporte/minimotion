import { TweenType } from './types';
import { getTransformValue, setTransformValue, TRANSFORMS } from './transforms';

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

const RX_CSS_NAME = /([a-z])([A-Z])/g;

/**
 * Transform js prop names into css propnames (e.g. "borderColor" into "border-color")
 * @param str 
 */
function stringToHyphens(str: string) {
    return str.replace(RX_CSS_NAME, '$1-$2').toLowerCase();
}

function isSVG(el) {
    return el.ownerSVGElement !== undefined; // instanceof SVGElement
}

/**
 * Identify the type of animation (transform vs attribute vs css style)
 * @param el 
 * @param propName 
 */
export function getAnimationType(el: any, propName: string): TweenType {
    if (el.nodeType || isSVG(el)) {
        if ((el.getAttribute(propName) || (isSVG(el) && el[propName]))) return 'attribute';
        if (TRANSFORMS.hasOwnProperty(propName)) return 'transform';
        return 'css';
    }
    return 'invalid';
}

export let dom = {
    /**
     * Return the current value of a targeted property
     * @param targetElt 
     * @param propName 
     * @param propType 
     */
    getValue(targetElt, propName, propType) {
        switch (propType) {
            case 'css': return dom.getCSSValue(targetElt, propName);
            case 'transform': return getTransformValue(targetElt, propName);
            case 'attribute': return targetElt.getAttribute(propName);
        }
    },

    setValue(targetElt, propName, propType, value) {
        if (!targetElt) return;
        switch (propType) {
            case 'css':
                targetElt.style[propName] = value;
                break;
            case 'transform':
                setTransformValue(targetElt, propName, value);
                break;
            case 'attribute':
                targetElt.setAttribute(propName, value);
                break;
            default:
                console.log("[animate] unsupported animation type: " + propType);
        }
    },

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
