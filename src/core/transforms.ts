function stringContains(str: string, text: string) {
  return str.indexOf(text) > -1;
}

export const TRANSFORMS = {
  transform: 1, // special property: contains the full transform value
  translateX: 1,
  translateY: 1,
  translateZ: 1,
  rotate: 1,
  rotateX: 1,
  rotateY: 1,
  rotateZ: 1,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  skewX: 1,
  skewY: 1,
  perspective: 1
};

export function getTransformUnit(propName: string) {
  if (stringContains(propName, "translate") || propName === "perspective") {
    return "px";
  }
  if (stringContains(propName, "rotate") || stringContains(propName, "skew")) {
    return "deg";
  }
  return "";
}

export function getElementTransforms(el: HTMLElement) {
  const str = el.style.transform || "";
  const reg = /(\w+)\(([^)]*)\)/g;
  const transforms = new Map<string, string>();
  let m: RegExpExecArray | null;
  while ((m = reg.exec(str))) {
    transforms.set(m[1], m[2]);
  }
  return transforms;
}

let elementTransformsCache = new WeakMap<HTMLElement, Map<string, string>>();
export function getFastElementTransforms(el: HTMLElement) {
  let result = elementTransformsCache.get(el);
  if (!result) {
    result = getElementTransforms(el);
    elementTransformsCache.set(el, result);
  }
  return result;
}

export function clearFastElementTransformsCache(el?: HTMLElement) {
  if (el) {
    elementTransformsCache.delete(el);
  } else {
    elementTransformsCache = new WeakMap();
  }
}

export function stringifyTransforms(transforms: Map<string, string>) {
  let output = "";
  for (const entry of transforms.entries()) {
    output += ` ${entry[0]}(${entry[1]})`;
  }
  return output;
}

export function getTransformValue(el: HTMLElement, propName: string) {
  if (propName === "transform") {
    return el.style.transform || "";
  }
  return (
    getFastElementTransforms(el).get(propName) ||
    (stringContains(propName, "scale") ? "1" : 0 + getTransformUnit(propName))
  );
}

export function setTransformValue(el: HTMLElement, propName: string, value) {
  if (propName === "transform") {
    el.style.transform = value;
    clearFastElementTransformsCache(el);
    return;
  }
  const transforms = getFastElementTransforms(el);
  transforms.set(propName, value);
  const transform = stringifyTransforms(transforms);
  el.style.transform = transform;
}
