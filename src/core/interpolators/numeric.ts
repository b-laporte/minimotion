import { getTransformUnit } from "../transforms";
import { ValueInterpolatorFactory } from "./types";
import { interpolate } from "./interpolate";

const RX_NUMERIC_PROP = /^(\*=|\+=|-=)?([+-]?[0-9#.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/,
  RX_DEFAULT_PX_PROPS = /(radius|width|height|top|left)$/i;

export const numericInterpolatorFactory: ValueInterpolatorFactory = (
  propFrom,
  propTo,
  options = {}
) => {
  const { propName, type, fromIsDom } = options;

  // propTo is a numeric prop - e.g. '20px' or '+=300.3em' or '0.3'
  const split = RX_NUMERIC_PROP.exec(propTo);
  if (!split) {
    return null;
  }
  const relOp = split[1];
  let to = parseFloat(split[2]);
  let unit = split[3] || "";
  let roundLevel = 10;

  // check consistency
  const split2 = RX_NUMERIC_PROP.exec(propFrom);
  if (!split2) return null;
  if (split2[1]) return null; // cannot be relative
  const fromUnit = split2[3] || "";
  if (unit && fromUnit && !fromIsDom && fromUnit !== unit) return null; // units have to be the same
  unit = unit || fromUnit; // if unit is not defined in to value, we use from value
  const from = parseFloat(split2[2]);

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
    roundLevel = 100; // unit-less properties should be rounded with 2 decimals by default (e.g. opacity)
  }
  return {
    getValue(easing: number) {
      return interpolate(from, to, easing, roundLevel) + unit;
    }
  };
};
