/** Generic utilities for strings */

import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";

/**
 * Check if the source includes searchText. To make a case-insensitive check
 * both the source and the searchText are converted to lower-case.
 *
 * @param source Source string where you want to search
 * @param searchText String you want search for
 */
export function isTextIncludedCaseInsensitive(
  source: string,
  searchText: string
) {
  return source.toLocaleLowerCase().includes(searchText.toLocaleLowerCase());
}

/**
 * Return the same text with each token has the first char in uppercase. tokens
 * are retrieved by splitting the text with the provided separator ex
 * capitalize("Hello World") -> "Hello Word" ex capitalize("hello,world",",") ->
 * "Hello,Word"
 *
 * @param text
 * @param separator
 */
export function capitalize(text: string, separator = " ") {
  return text
    .split(separator)
    .reduce(
      (acc: string, curr: string, index: number) =>
        `${acc}${index === 0 ? "" : separator}${curr.replace(
          new RegExp(curr.trimLeft(), "ig"),
          _.capitalize(curr.trimLeft())
        )}`,
      ""
    );
}

/**
 * Determine if the text is undefined or empty (or composed only by blanks)
 *
 * @param text
 */
export const isStringNullyOrEmpty = (
  text: string | null | undefined
): boolean =>
  pipe(
    text,
    O.fromNullable,
    O.fold(
      () => true,
      t => t.trim().length === 0
    )
  );

/**
 * Return some(text) if the text is not nully and not empty (or composed only by
 * blanks)
 *
 * @param text
 */
export const maybeNotNullyString = (
  text: string | null | undefined
): O.Option<string> =>
  pipe(
    O.fromPredicate((t: string) => t.trim().length > 0)(
      pipe(
        text,
        O.fromNullable,
        O.getOrElse(() => "")
      )
    )
  );

/**
 * Return a string by adding 'toAdd' every 'every' chars
 *
 * @param text
 * @param toAdd
 * @param every
 */
export const addEvery = (text: string, toAdd: string, every: number): string =>
  text
    .replace(/\W/gi, "")
    .replace(new RegExp(`(.{${every}})`, "g"), `$1${toAdd}`);

/**
 * Split text using the specified splitter and return the first substring
 *
 * @param text
 * @param splitter
 */
export const splitAndTakeFirst = (text: string, splitter: string) =>
  text.split(splitter)[0];

export const withTrailingPoliceCarLightEmojii = (
  text: string,
  visible = true
) => {
  if (visible) {
    return `${text} \u{1F6A8}`;
  } else {
    return text;
  }
};

/**
 * Format a number of bytes in a human readable format with the appropriate unit
 * (B, KB, MB, GB, TB) rounded to the first decimal.
 *
 * @param bytes - Number of bytes to format
 * @returns Formatted string in the form of "value unit"
 */
export const formatBytesWithUnit = (bytes: number) => {
  if (!bytes || bytes < 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  // We are calculating log1000(bytes) to determine the unit by changing log base (Math.log10(1000) = 3)
  const i = Math.floor(Math.log10(bytes) / 3);
  const value = parseFloat((bytes / Math.pow(1000, i)).toFixed(1));
  const unit = units[Math.min(i, units.length - 1)];
  return `${value} ${unit}`;
};

/**
 * Capitalizes the first letter of each word in the given text, preserving
 * leading and trailing spaces. Words are separated by the specified separator.
 * Handles words with apostrophes by capitalizing the first letter of each
 * sub-token.
 *
 * @example
 *   capitalizeTextName(" hello world "); // returns " Hello World "
 *
 * @example
 *   capitalizeTextName("d'angelo"); //returns "D'Angelo"
 *
 * @param {string} text
 * @param {string} [separator=" "] Default is `" "`
 * @returns {string}
 */

export const capitalizeTextName = (text: string, separator = " "): string => {
  // Match leading and trailing spaces
  const leadingSpacesMatch = /^\s*/.exec(text);
  const trailingSpacesMatch = /\s*$/.exec(text);

  const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[0] : "";
  const trailingSpaces = trailingSpacesMatch ? trailingSpacesMatch[0] : "";

  // Capitalize the words between the separators
  const capitalizedText = text
    .trim() // Remove leading/trailing spaces for processing
    .split(separator)
    .map(token =>
      // Handle words with apostrophes
      token
        .split("'")
        .map(subToken => _.upperFirst(subToken.toLowerCase()))
        .join("'")
    )
    .join(separator);

  // Re-add the leading and trailing spaces
  return `${leadingSpaces}${capitalizedText}${trailingSpaces}`;
};
