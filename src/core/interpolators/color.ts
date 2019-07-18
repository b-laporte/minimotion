import { ValueInterpolatorFactory } from "./types";
import { interpolate } from "./interpolate";

const RX_HEX1 = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
  RX_HEX2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
  RX_RGB = /rgb\(\s*(\d+)\s*\,\s*(\d+)\s*\,\s*(\d+)\s*\)/,
  RX_RGBA = /rgba\(\s*(\d+)\s*\,\s*(\d+)\s*\,\s*(\d+)\s*\,\s*([\d\.]+)\s*\)/,
  RX_HSL = /hsl\(\s*(\d+)\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*\)/,
  RX_HSLA = /hsla\(\s*(\d+)\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*\,\s*([\d\.]+)\s*\)/;

/**
 * Parse a CSS color string and return an array [r, g, b, a] or null is the value is not a color
 * @param value a color value - e.g. '#FFF' or '#0050FF' or 'rgba(12,45,125,1)' etc.
 */
export function parseColor(value: string | null): number[] | null {
  if (!value) return null;
  let r: number[] | null;
  r = parseHexColor(value);
  if (!r) {
    r = parseRgbColor(value);
    if (!r) {
      r = parseHslColor(value);
    }
  }
  return r;
}

function parseHexColor(value: string): number[] | null {
  const hex = value.replace(RX_HEX1, (m, r, g, b) => r + r + g + g + b + b);
  const rgb = RX_HEX2.exec(hex);
  if (!rgb) return null;
  return [parseInt(rgb[1], 16), parseInt(rgb[2], 16), parseInt(rgb[3], 16), 1];
}

function parseRgbColor(value: string): number[] | null {
  const rgb = RX_RGB.exec(value) || RX_RGBA.exec(value);
  if (!rgb) return null;
  let a = 1;
  if (rgb[4] !== undefined) {
    a = parseFloat(rgb[4]);
  }
  return [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10), a];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function parseHslColor(value: string): number[] | null {
  const hsl = RX_HSL.exec(value) || RX_HSLA.exec(value);
  if (!hsl) return null;
  const h = parseInt(hsl[1]) / 360;
  const s = parseInt(hsl[2]) / 100;
  const l = parseInt(hsl[3]) / 100;
  let a = 1;
  if (hsl[4] !== undefined) {
    a = parseFloat(hsl[4]);
  }
  let r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255, a];
}

export const colorInterpolatorFactory: ValueInterpolatorFactory = (
  propFrom,
  propTo,
  options = {}
) => {
  const { fromIsDom } = options;

  const to = parseColor(propTo);
  if (!to) return null;
  let from = parseColor(propFrom);
  if (fromIsDom && !from) {
    from = [0, 0, 0, 1];
  }
  if (!from) return null;

  return {
    getValue(easing: number) {
      let rgba: number[] = [];
      for (let i = 0; 4 > i; i++) {
        rgba.push(interpolate(from![i], to[i], easing, i == 3 ? 100 : 1));
      }
      return `rgba(${rgba.join(", ")})`;
    }
  };
};
