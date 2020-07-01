import { Option, some } from "fp-ts/lib/Option";
import { Locales } from "../../locales/locales";
import I18n, { translations } from "../i18n";
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

export const getLocalePrimaryWithFallback = (fallback: Locales = "en") =>
  getLocalePrimary(I18n.currentLocale())
    .filter(l => translations.some(t => t === l))
    .map(s => s as Locales)
    .getOrElse(fallback);
