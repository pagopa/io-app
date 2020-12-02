import { fromNullable, Option, some } from "fp-ts/lib/Option";
import { Locales } from "../../locales/locales";
import I18n, { translations } from "../i18n";
import { PreferredLanguageEnum } from "../../definitions/backend/PreferredLanguage";
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

// return the current locale set in the device (this could be different from the app supported languages)
export const getCurrentLocale = (): Locales => I18n.currentLocale();

/**
 * return the primary component of the current locale (i.e: it-US -> it)
 * if the current locale (the language set in the device) is not a language supported by the app
 * the fallback will returned
 * @param fallback
 */
export const getLocalePrimaryWithFallback = (fallback: Locales = "en") =>
  getLocalePrimary(getCurrentLocale())
    .filter(l => translations.some(t => t.toLowerCase() === l.toLowerCase()))
    .map(s => s as Locales)
    .getOrElse(fallback);

const localeToPreferredLanguageMapping = new Map<
  Locales,
  PreferredLanguageEnum
>([
  ["it", PreferredLanguageEnum.it_IT],
  ["en", PreferredLanguageEnum.en_GB]
]);

const preferredLanguageMappingToLocale = new Map<
  PreferredLanguageEnum,
  Locales
>(Array.from(localeToPreferredLanguageMapping).map(item => [item[1], item[0]]));

export const localeDateFormat = (date: Date, format: string): string =>
  isNaN(date.getTime())
    ? I18n.t("global.date.invalid")
    : I18n.strftime(date, format);

// from a given Locales return the relative PreferredLanguageEnum (fallback is en_GB)
export const fromLocaleToPreferredLanguage = (
  locale: Locales
): PreferredLanguageEnum =>
  fromNullable(localeToPreferredLanguageMapping.get(locale)).getOrElse(
    PreferredLanguageEnum.en_GB
  );

// from a given preferredLanguage return the relative Locales (fallback is en)
export const fromPreferredLanguageToLocale = (
  preferredLanguage: PreferredLanguageEnum
): Locales =>
  fromNullable(
    preferredLanguageMappingToLocale.get(preferredLanguage)
  ).getOrElse("en");
