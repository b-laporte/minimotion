import { ValueInterpolatorFactory } from "./types";

export const constantInterpolatorFactory: ValueInterpolatorFactory = (
  from,
  to
) => {
  if (from !== to) {
    return null;
  }
  return {
    getValue() {
      return to;
    }
  };
};
