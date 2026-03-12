/* eslint-disable no-bitwise */
const clampUnit = (value: number) => Math.max(0, Math.min(1, value));

const normalizeHue = (hue: number) => (hue < 0 ? hue + 360 : hue);

// Hue depends on which RGB channel is dominant in the normalized color.
const getHueFromRgbChannels = (
  maxChannel: number,
  red: number,
  green: number,
  blue: number,
  delta: number
) => {
  const rawHue =
    maxChannel === red
      ? 60 * (((green - blue) / delta) % 6)
      : maxChannel === green
      ? 60 * ((blue - red) / delta + 2)
      : 60 * ((red - green) / delta + 4);

  return normalizeHue(rawHue);
};

// Each 60-degree hue sector maps chroma/intermediate values onto a different RGB triplet.
const getRgbChannelsFromHueSector = (
  hue: number,
  chroma: number,
  intermediate: number
): [number, number, number] =>
  hue < 60
    ? [chroma, intermediate, 0]
    : hue < 120
    ? [intermediate, chroma, 0]
    : hue < 180
    ? [0, chroma, intermediate]
    : hue < 240
    ? [0, intermediate, chroma]
    : hue < 300
    ? [intermediate, 0, chroma]
    : [chroma, 0, intermediate];

export const hexToRgb = (hex: string) => {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

export const getLuminance = (hexColor: string) => {
  const { r, g, b } = hexToRgb(hexColor);
  const [R, G, B] = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

export const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  const h = getHueFromRgbChannels(max, red, green, blue, delta);

  return { h, s, l };
};

export const hslToHex = (h: number, s: number, l: number): string => {
  // HSL -> RGB uses chroma/intermediate/offset to reconstruct the final channels.
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const intermediate = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const offset = l - chroma / 2;

  const [red, green, blue] = getRgbChannelsFromHueSector(
    h,
    chroma,
    intermediate
  );

  const toHex = (n: number) =>
    Math.round((n + offset) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

/**
 * Shifts a color's lightness and saturation in HSL space, keeping the hue unchanged.
 * Positive offsets make the color lighter/more saturated, negative offsets darker/less saturated.
 */
export const adjustColorHsl = (
  hex: string,
  lightnessOffset: number,
  saturationOffset: number = 0
): string => {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(
    h,
    clampUnit(s + saturationOffset),
    clampUnit(l + lightnessOffset)
  );
};
