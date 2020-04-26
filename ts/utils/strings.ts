/**
 * Generic utilities for strings
 */

import _ from "lodash";

/**
 * Check if the source includes searchText.
 * To make a case-insensitive check both the source and the searchText are
 * converted to lower-case.
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
 * return the same text with each token has the first char in uppercase.
 * tokens are retrieved by splitting the text with the provided separator
 * ex capitalize("Hello World") -> "Hello Word"
 * ex capitalize("hello,world",",") -> "Hello,Word"
 * @param text
 * @param separator
 */
export function capitalize(text: string, separator: string = " ") {
  return text
    .split(separator)
    .reduce((acc: string, curr: string, index: number) => {
      return `${acc}${index === 0 ? "" : separator}${curr.replace(
        new RegExp(curr.trimLeft(), "ig"),
        _.capitalize(curr.trimLeft())
      )}`;
    }, "");
}
