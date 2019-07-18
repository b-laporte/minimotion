export * from "./types";
export * from "./auto";
export * from "./constant";
export * from "./numeric";
export * from "./color";
export * from "./array";

import { createAutoInterpolatorFactory } from "./auto";
import { constantInterpolatorFactory } from "./constant";
import { numericInterpolatorFactory } from "./numeric";
import { colorInterpolatorFactory } from "./color";
import { createArrayInterpolatorFactory } from "./array";

export const INTERPOLATORS = [
  constantInterpolatorFactory,
  numericInterpolatorFactory,
  colorInterpolatorFactory
];
export const createInterpolator = createAutoInterpolatorFactory(INTERPOLATORS);
INTERPOLATORS.push(createArrayInterpolatorFactory(createInterpolator));
