// eslint-disable-next-line no-restricted-imports
import i18nJS from "i18n-js";

import i18next, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

import { PreferredLanguageEnum } from "../definitions/auth/PreferredLanguage";
import { BackendStatusMessage } from "../definitions/content/BackendStatusMessage";
import { Locales } from "../locales/locales";

import it from "../locales/it/index.json";
import en from "../locales/en/index.json";
import de from "../locales/de/index.json";

const resources = {
  it: {
    translation: it
  },
  en: {
    translation: en
  },
  de: {
    translation: de
  }
};

// This setup is needed to properly handle date and currency formats
// eslint-disable-next-line functional/immutable-data
i18nJS.translations = {
  it,
  en,
  de
};

export type LocalizedMessageKeys = keyof BackendStatusMessage;
type FallBackLocale = {
  localizedMessageKey: LocalizedMessageKeys;
  locale: "it";
  localeEnum: PreferredLanguageEnum;
};

export const localeToLocalizedMessageKey = new Map<
  Locales,
  LocalizedMessageKeys
>([
  ["it", "it-IT"],
  ["en", "en-EN"],
  ["de", "de-DE"]
]);

export const localeToPreferredLanguageMapping = new Map<
  Locales,
  PreferredLanguageEnum
>([
  ["it", PreferredLanguageEnum.it_IT],
  ["en", PreferredLanguageEnum.en_GB],
  ["de", PreferredLanguageEnum.de_DE]
]);

// define the locale fallback used in the whole app code
export const localeFallback: FallBackLocale = {
  localizedMessageKey: "it-IT",
  locale: "it",
  localeEnum: PreferredLanguageEnum.it_IT
};
export const availableTranslations: ReadonlyArray<Locales> = Object.keys(
  resources
).map(k => k as Locales);

export const initI18n = async () =>
  await i18next.use(initReactI18next).init({
    lng: "it",
    fallbackLng: "it",
    react: {
      useSuspense: true
    },
    resources
  } as InitOptions);

export const setLocale = (locale: Locales) => {
  void i18next.changeLanguage(locale);
  // This change is needed to properly handle date and currency formats
  // eslint-disable-next-line functional/immutable-data
  i18nJS.locale = locale;
};
export const I18nJS = i18nJS;
