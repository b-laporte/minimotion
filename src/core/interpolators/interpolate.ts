const trunc = Math.trunc;

export function interpolate(
  from: number,
  to: number,
  easing: number,
  decimalLevel: number
) {
  return trunc((from + (to - from) * easing) * decimalLevel) / decimalLevel;
}
