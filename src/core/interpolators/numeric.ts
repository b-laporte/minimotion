import { getTransformUnit } from "../transforms";
import { ValueInterpolatorFactory } from "./types";
import { interpolate } from "./interpolate";

const RX_NUMERIC_PROP = /^(\*=|\+=|-=)?([+-]?([0-9]*)(\.[0-9]*)?)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/,
  RX_DEFAULT_PX_PROPS = /(radius|width|height|top|left)$/i;

const parseNumericProp = (number: string) => {
  const result = RX_NUMERIC_PROP.exec(number);
  if (result) {
    const [, relOp, strNumber, beforeDot, afterDot, unit] = result;
    const fractionDigits = afterDot ? afterDot.length - 1 : 0;
    if (beforeDot || fractionDigits) {
      const num = +strNumber;
      return {
        relOp,
        num,
        unit,
        fractionDigits
      };
    }
  }
  return null;
};

export const numericInterpolatorFactory: ValueInterpolatorFactory = (
  propFrom,
  propTo,
  options = {}
) => {
  const { propName, type, fromIsDom } = options;

  // propTo is a numeric prop - e.g. '20px' or '+=300.3em' or '0.3'
  const parsedTo = parseNumericProp(propTo);
  if (!parsedTo) return null;
  const relOp = parsedTo.relOp;
  let to = parsedTo.num;
  let unit = parsedTo.unit || "";
  let fractionDigits = 1;

  // check consistency
  const parsedFrom = parseNumericProp(propFrom);
  if (!parsedFrom) return null;
  if (parsedFrom.relOp) return null; // cannot be relative
  const fromUnit = parsedFrom.unit || "";
  if (unit && fromUnit && !fromIsDom && fromUnit !== unit) return null; // units have to be the same
  unit = unit || fromUnit; // if unit is not defined in to value, we use from value
  const from = parsedFrom.num;

  if (!unit) {
    // set default unit for common properties
    if (propName) {
      if (type === "transform") {
        unit = getTransformUnit(propName);
      } else if (type === "css" && propName.match(RX_DEFAULT_PX_PROPS)) {
        unit = "px";
      }
    }
  }

  switch (relOp) {
    case "+=": {
      to += from;
      break;
    }
    case "-=": {
      to = from - to;
      break;
    }
    case "*=": {
      to *= from;
      break;
    }
  }
  if (!unit) {
    fractionDigits = 2; // unit-less properties should be rounded with 2 decimals by default (e.g. opacity)
  }
  fractionDigits = Math.max(
    fractionDigits,
    parsedFrom.fractionDigits,
    parsedTo.fractionDigits
  );
  const roundLevel = 10 ** fractionDigits;
  return {
    getValue(easing: number) {
      return interpolate(from, to, easing, roundLevel) + unit;
    }
  };
};
