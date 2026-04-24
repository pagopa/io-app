const componentToHex = (c: number) => {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

// HEX

/**
 * Converts a hexadecimal color string to an RGB (Red, Green, Blue)
 */
export const hexToRgb = (hex: string) => {
  const matches = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!matches) {
    return undefined;
  }
  return [
    parseInt(matches[1], 16),
    parseInt(matches[2], 16),
    parseInt(matches[3], 16)
  ] as const;
};

/**
 * Converts a hexadecimal color string to HSL (Hue, Saturation, Lightness).
 */
export const hexToHsl = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgb && rgbToHsl(rgb[0], rgb[1], rgb[2]);
};

/**
 * Converts a hexadecimal color string to HSB (Hue, Saturation, Brightness).
 */
export const hexToHsb = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgb && rgbToHsb(rgb[0], rgb[1], rgb[2]);
};

// RGB

/**
 * Converts RGB color values to a hexadecimal color string.
 */
export const rgbToHex = (r: number, g: number, b: number) =>
  "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

/**
 * Converts RGB color values to HSL (Hue, Saturation, Lightness).
 */
export const rgbToHsl = (r: number, g: number, b: number) => {
  const r255 = r / 255;
  const g255 = g / 255;
  const b255 = b / 255;

  const max = Math.max(r255, g255, b255);
  const min = Math.min(r255, g255, b255);
  const l = (max + min) / 2;
  const d = max - min;

  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  const h = (() => {
    if (d === 0) {
      return 0;
    }
    switch (max) {
      case r255:
        return ((g255 - b255) / d + (g255 < b255 ? 6 : 0)) * 60;
      case g255:
        return ((b255 - r255) / d + 2) * 60;
      case b255:
        return ((r255 - g255) / d + 4) * 60;
      default:
        return 0;
    }
  })();

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
};

/**
 * Converts RGB color values to HSB (Hue, Saturation, Brightness).
 */
export const rgbToHsb = (r: number, g: number, b: number) => {
  const r255 = r / 255;
  const g255 = g / 255;
  const b255 = b / 255;

  const max = Math.max(r255, g255, b255);
  const min = Math.min(r255, g255, b255);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  const h = (() => {
    if (max === min) {
      return 0;
    }
    switch (max) {
      case r255:
        return (g255 - b255) / d + (g255 < b255 ? 6 : 0);
      case g255:
        return (b255 - r255) / d + 2;
      case b255:
        return (r255 - g255) / d + 4;
      default:
        return 0;
    }
  })();

  return [Math.round(h * 60), Math.round(s * 100), Math.round(v * 100)];
};

// HSL

/**
 * Converts HSL color values to RGB (Red, Green, Blue).
 */
export const hslToRgb = (h: number, s: number, l: number) => {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const light = l / 100;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;

  const [r1, g1, b1] = (() => {
    if (hue < 60) {
      return [c, x, 0];
    }
    if (hue < 120) {
      return [x, c, 0];
    }
    if (hue < 180) {
      return [0, c, x];
    }
    if (hue < 240) {
      return [0, x, c];
    }
    if (hue < 300) {
      return [x, 0, c];
    }
    return [c, 0, x];
  })();

  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255)
  ];
};

/**
 * Converts HSL color values to a hexadecimal color string.
 */
export const hslToHex = (h: number, s: number, l: number) => {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

/**
 * Converts HSL color values to HSB (Hue, Saturation, Brightness).
 */
export const hslToHsb = (h: number, s: number, l: number) => {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHsb(r, g, b);
};

// HSB

/**
 * Converts HSB color values to RGB (Red, Green, Blue).
 */
export const hsbToRgb = (h: number, s: number, b: number) => {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const value = b / 100;

  const c = value * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - c;

  const [r1, g1, b1] = (() => {
    if (hue < 60) {
      return [c, x, 0];
    }
    if (hue < 120) {
      return [x, c, 0];
    }
    if (hue < 180) {
      return [0, c, x];
    }
    if (hue < 240) {
      return [0, x, c];
    }
    if (hue < 300) {
      return [x, 0, c];
    }
    return [c, 0, x];
  })();

  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255)
  ];
};

/**
 * Converts HSB color values to a hexadecimal color string.
 */
export const hsbToHex = (h: number, s: number, b: number) => {
  const [r, g, bValue] = hsbToRgb(h, s, b);
  return rgbToHex(r, g, bValue);
};

/**
 * Converts HSB color values to HSL (Hue, Saturation, Lightness).
 */
export const hsbToHsl = (h: number, s: number, b: number) => {
  const [r, g, bValue] = hsbToRgb(h, s, b);
  return rgbToHsl(r, g, bValue);
};

// Utilities

/**
 * Calculates the relative luminance of a color given its hexadecimal
 * representation.
 */
export const getLuminance = (hexColor: string) => {
  const [r, g, b] = hexToRgb(hexColor) || [0, 0, 0];
  const [R, G, B] = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};
