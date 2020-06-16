/**
 * Generic utilities for strings
 */

import { fromNullable, fromPredicate, Option } from "fp-ts/lib/Option";
import _ from "lodash";
import { EnteBeneficiario } from "../../definitions/backend/EnteBeneficiario";

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

/**
 * Convert the EnteBEneficiario content type in a readable string
 * @param e organization data
 */
export const formatTextRecipient = (e: EnteBeneficiario): string => {
  const denomUnitOper = fromNullable(e.denomUnitOperBeneficiario)
    .map(d => ` - ${d}`)
    .getOrElse("");
  const address = fromNullable(e.indirizzoBeneficiario).getOrElse("");
  const civicNumber = fromNullable(e.civicoBeneficiario)
    .map(c => ` n. ${c}`)
    .getOrElse("");
  const cap = fromNullable(e.capBeneficiario)
    .map(c => `${c} `)
    .getOrElse("");
  const city = fromNullable(e.localitaBeneficiario)
    .map(l => `${l} `)
    .getOrElse("");
  const province = fromNullable(e.provinciaBeneficiario)
    .map(p => `(${p})`)
    .getOrElse("");

  return `${e.denominazioneBeneficiario}${denomUnitOper}\n
${address}${civicNumber}\n
${cap}${city}${province}`.trim();
};

/**
 * determine if the text is undefined or empty (or composed only by blanks)
 * @param text
 */
export const isStringNullyOrEmpty = (
  text: string | null | undefined
): boolean => fromNullable(text).fold(true, t => t.trim().length === 0);

/**
 * return some(text) if the text is not nully and not empty (or composed only by blanks)
 * @param text
 */
export const maybeNotNullyString = (
  text: string | null | undefined
): Option<string> =>
  fromPredicate((t: string) => t.trim().length > 0)(
    fromNullable(text).getOrElse("")
  );

/**
 * Adds a space every four characters
 * @param text
 */
export const spaceEveryFour = (text: string) =>
  text.replace(/\W/gi, "").replace(/(.{4})/g, "$1 ");
