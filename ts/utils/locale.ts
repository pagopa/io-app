import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Locales } from "../../locales/locales";
import {
  availableTranslations,
  localeFallback,
  localeToLocalizedMessageKey,
  localeToPreferredLanguageMapping,
  LocalizedMessageKeys
} from "../i18n";
import { LanguageEnum } from "../../definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { PreferredLanguageEnum } from "../../definitions/backend/identity/PreferredLanguage";
/**
 * Helpers for handling locales
 */

/**
 * Return a full string locale. (it -> it-IT)
 * If not italian, for all other languages italian is the default.
 */
export const getFullLocale = (): LocalizedMessageKeys =>
  localeToLocalizedMessageKey.get(I18n.language as Locales) ??
  localeFallback.localizedMessageKey;
/**
 * Returns the primary component of a locale
 *
 * @see https://en.wikipedia.org/wiki/IETF_language_tag
 */
export function getLocalePrimary(
  locale: string,
  separator: string = "-"
): O.Option<string> {
  return pipe(
    O.some(locale.split(separator)),
    O.filter(_ => _.length > 0),
    O.chain(AR.head)
  );
}

// return the current locale set in the device (this could be different from the app supported languages)
export const getCurrentLocale = (): Locales => I18n.language as Locales;

/**
 * return the primary component of the current locale (i.e: it-US -> it)
 * if the current locale (the language set in the device) is not a language supported by the app
 * the fallback will returned
 */
export const getLocalePrimaryWithFallback = (): Locales =>
  pipe(
    getLocalePrimary(getCurrentLocale()),
    O.filter(l =>
      availableTranslations.some(t => t.toLowerCase() === l.toLowerCase())
    ),
    O.map(s => s as Locales),
    O.getOrElseW(() => localeFallback.locale)
  );

const preferredLanguageMappingToLocale = new Map<
  PreferredLanguageEnum,
  Locales
>(Array.from(localeToPreferredLanguageMapping).map(item => [item[1], item[0]]));

// from a given Locales return the relative PreferredLanguageEnum
export const fromLocaleToPreferredLanguage = (
  locale: Locales
): PreferredLanguageEnum =>
  pipe(
    localeToPreferredLanguageMapping.get(locale),
    O.fromNullable,
    O.getOrElse(() => localeFallback.localeEnum)
  );

// from a given preferredLanguage return the relative Locales
export const fromPreferredLanguageToLocale = (
  preferredLanguage: PreferredLanguageEnum
): Locales =>
  pipe(
    preferredLanguageMappingToLocale.get(preferredLanguage),
    O.fromNullable,
    O.getOrElseW(() => localeFallback.locale)
  );

// This function is for the case where the localized message key is not available. When german translation is not available, we use italian as a fallback.
// This function will be removed when the german translation will be available for all the keys.
export const fallbackForLocalizedMessageKeys = (
  locale: LocalizedMessageKeys
): Exclude<LocalizedMessageKeys, "de-DE"> =>
  locale === "de-DE" ? "it-IT" : locale;

export const getLanguageEnumFromPreferredLocale = (): LanguageEnum =>
  LanguageEnum[
    (I18n.language as Locales).toUpperCase() as keyof typeof LanguageEnum
  ];
