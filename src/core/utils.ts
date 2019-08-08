import { TweenType, Target } from './types';
import { getTransformValue, setTransformValue, TRANSFORMS } from './transforms';

let LOG_ACTIVE = false;

export function log(...args: any[]) {
    if (LOG_ACTIVE) {
        console.log(...args);
    }
}

export function activateLogs() {
    LOG_ACTIVE = true;
}

export function deactivateLogs() {
    LOG_ACTIVE = false;
}

export function parseValue(name, params, defaults) {
    const v = params[name];
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
 * @param target 
 * @param propName 
 */
export function getAnimationType(target: Target, propName: string): TweenType {
    if (target != null && (target.nodeType || isSVG(target))) {
        if ((target.hasAttribute(propName) || (isSVG(target) && target[propName]))) return 'attribute';
        if (TRANSFORMS[propName] === 1) return 'transform';
        return 'css';
    }
    return 'custom';
}

export const dom = {
    /**
     * Return the current value of a targeted property
     */
    getValue(property, target, type) {
        switch (type) {
            case 'css': return dom.getCSSValue(target, property);
            case 'transform': return getTransformValue(target, property);
            case 'attribute': return target.getAttribute(property);
        }
    },

    setValue(property, target, type, value) {
        if (!target) return;
        switch (type) {
            case 'css':
                target.style[property] = value;
                break;
            case 'transform':
                setTransformValue(target, property, value);
                break;
            case 'attribute':
                target.setAttribute(property, value);
                break;
            default:
                console.log("[animate] unsupported animation type: " + type);
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
