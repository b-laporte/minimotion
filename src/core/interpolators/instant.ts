import { ValueInterpolatorFactory } from "./types";

export const instantInterpolatorFactory: ValueInterpolatorFactory = (
  from,
  to
) => {
  return {
    getValue(easing: number) {
      return easing < 0.5 ? from : to;
    }
  };
};
