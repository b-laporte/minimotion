const round = Math.round;

export function interpolate(
  from: number,
  to: number,
  easing: number,
  decimalLevel: number
) {
  return round((from + (to - from) * easing) * decimalLevel) / decimalLevel;
}
