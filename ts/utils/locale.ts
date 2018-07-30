import { Option, some } from "fp-ts/lib/Option";

/**
 * Helpers for handling locales
 */

/**
 * Returns the primary component of a locale
 *
 * @see https://en.wikipedia.org/wiki/IETF_language_tag
 */
export function getLocalePrimary(
  locale: string,
  separator: string = "-"
): Option<string> {
  return some(locale.split(separator))
    .filter(_ => _.length > 0)
    .map(_ => _[0]);
}
