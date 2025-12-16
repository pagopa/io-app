import i18next, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

import { BackendStatusMessage } from "../definitions/content/BackendStatusMessage";
import { Locales } from "../locales/locales";

import it from "../locales/it/index.json";
import en from "../locales/en/index.json";
import de from "../locales/de/index.json";
import { PreferredLanguageEnum } from "../definitions/session_manager/PreferredLanguage";

const resources = {
  it: {
    index: it
  },
  en: {
    index: en
  },
  de: {
    index: de
  }
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
  ["de", PreferredLanguageEnum.de_DE],
  ["sl", PreferredLanguageEnum.sl_SI]
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
    defaultNS: "index",
    react: {
      useSuspense: true
    },
    interpolation: { escapeValue: false },
    resources
  } as InitOptions);

export const setLocale = (locale: Locales) => {
  void i18next.changeLanguage(locale);
};
