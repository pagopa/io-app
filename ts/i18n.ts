import i18next, {
  BackendModule,
  InitOptions,
  ReadCallback,
  Services
} from "i18next";
import { initReactI18next } from "react-i18next";

import { captureException } from "@sentry/react-native";
import { BackendStatusMessage } from "../definitions/content/BackendStatusMessage";
import { Locales } from "../locales/locales";

import it from "../locales/it/index.json";
import en from "../locales/en/index.json";
import de from "../locales/de/index.json";
import { PreferredLanguageEnum } from "../definitions/session_manager/PreferredLanguage";
import { newContentRepoUrl } from "./config";

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

export interface SmartBackendOptions {
  localResources: typeof resources; // La struttura standard delle risorse i18next
}

class SmartI18nextBackend implements BackendModule<SmartBackendOptions> {
  static type = "backend";
  type = "backend" as const;

  services: Services | null = null;
  options: SmartBackendOptions | null = null;

  constructor(
    services: Services,
    options: SmartBackendOptions = { localResources: resources }
  ) {
    this.init(services, options, {});
  }

  init(services: Services, options: SmartBackendOptions, _: InitOptions) {
    // eslint-disable-next-line functional/immutable-data
    this.services = services;
    // eslint-disable-next-line functional/immutable-data
    this.options = options;
  }

  read(language: Locales, namespace: "index", callback: ReadCallback) {
    const localData = this.options?.localResources[language][namespace] || {};
    callback(null, localData);
    void this.loadRemote(language, namespace);
  }

  async loadRemote(language: Locales, namespace: string) {
    try {
      const url = `${newContentRepoUrl}/locales/${language}/${namespace}.json`;
      const response = await fetch(url);
      const remoteData = await response.json();

      i18next.addResourceBundle(language, namespace, remoteData, true, true);
    } catch (error) {
      captureException(error);
    }
  }
}

export const initI18n = async () =>
  await i18next
    .use(initReactI18next)
    .use(SmartI18nextBackend)
    .init({
      lng: "it",
      fallbackLng: "it",
      initAsync: false,
      ns: ["index"],
      defaultNS: "index",
      react: {
        useSuspense: true
      },
      backend: {
        localResources: resources
      },
      interpolation: { escapeValue: false }
    });

export const setLocale = (locale: Locales) => {
  void i18next.changeLanguage(locale);
};
