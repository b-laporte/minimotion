import { ValueInterpolatorFactory } from "./types";

export const createAutoInterpolatorFactory = (
  interpolators: ValueInterpolatorFactory[]
): ValueInterpolatorFactory => (from, to, options) => {
  for (let interpolator of interpolators) {
    const result = interpolator(from, to, options);
    if (result) {
      return result;
    }
  }
  return null;
};
