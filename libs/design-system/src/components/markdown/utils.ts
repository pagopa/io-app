import { IOPictogramsBleed } from "../pictograms";
import type { MarkdownNode } from "./types";

const BULLET_FULL = "\u2022";
const BULLET_HOLLOW = "\u25E6";
const BULLET_SQUARE = "\u25B8";

const PICTOGRAM_REGEXP = /^\s*\[!(.*?)\]/;

const ROMAN_NUMERALS: ReadonlyArray<readonly [number, string]> = [
  [1000, "m"],
  [900, "cm"],
  [500, "d"],
  [400, "cd"],
  [100, "c"],
  [90, "xc"],
  [50, "l"],
  [40, "xl"],
  [10, "x"],
  [9, "ix"],
  [5, "v"],
  [4, "iv"],
  [1, "i"]
];

/**
 * Returns the bullet glyph used for unordered lists at a given nesting depth.
 */
export const getUnorderedListBullet = (listDepth: number): string => {
  switch (listDepth % 3) {
    case 0:
      return BULLET_FULL;
    case 1:
      return BULLET_HOLLOW;
    default:
      return BULLET_SQUARE;
  }
};

/**
 * Converts a positive integer to its lowercase Roman numeral representation.
 */
const toRomanNumeral = (value: number, index = 0): string => {
  const numeral = ROMAN_NUMERALS[index];

  if (value <= 0 || numeral === undefined) {
    return "";
  }

  const [arabic, roman] = numeral;

  if (value >= arabic) {
    // Consume the current numeral and keep using it until the remainder is smaller.
    return `${roman}${toRomanNumeral(value - arabic, index)}`;
  }

  // Try the next Roman numeral when the current one no longer fits.
  return toRomanNumeral(value, index + 1);
};

/**
 * Converts a positive integer to a lowercase alphabetic sequence (`a`, `b`, `aa`).
 */
const toAlphabeticMarker = (value: number): string => {
  if (value <= 0) {
    return "";
  }

  // Convert to a zero-based base-26 index so 1 -> a, 26 -> z, 27 -> aa.
  const normalizedValue = value - 1;
  const prefix = toAlphabeticMarker(Math.floor(normalizedValue / 26));
  const suffix = String.fromCodePoint(97 + (normalizedValue % 26));

  return `${prefix}${suffix}`;
};

/**
 * Returns the ordered-list marker for a given item index and nesting depth.
 */
export const getOrderedListMarker = (
  value: number,
  listDepth: number
): string => {
  switch (listDepth % 3) {
    case 0:
      return `${value}.`;
    case 1:
      return `${toRomanNumeral(value)}.`;
    default:
      return `${toAlphabeticMarker(value)}.`;
  }
};

/**
 * Extracts a banner pictogram name from a `[!pictogramName]` prefix.
 */
export const extractPictogramName = (text: string): IOPictogramsBleed => {
  const match = PICTOGRAM_REGEXP.exec(text);
  const value = match?.[1];
  const isValid = value != null && value in IOPictogramsBleed;
  return isValid ? (value as IOPictogramsBleed) : "notification";
};

/**
 * Removes the leading pictogram directive from blockquote content.
 */
export const stripPictogramPrefix = (text: string): string =>
  text.replace(PICTOGRAM_REGEXP, "");

/**
 * Recursively collects plain text content from a Markdown AST node.
 */
export const collectRawText = (node: MarkdownNode): string => {
  if (node.content) {
    return node.content;
  }

  return node.children.map(collectRawText).join("");
};

/**
 * Returns true when a raw HTML fragment is a `<br>` tag.
 */
export const isBrTag = (content: string): boolean => {
  const match = new RegExp(/<([^\s/>]+)\s*\/?>/).exec(content);
  return match?.[1] === "br";
};
