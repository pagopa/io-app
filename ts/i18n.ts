import _ from "lodash";
import i18next, { ReadCallback } from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend, { HttpBackendOptions } from "i18next-http-backend";

import { BackendStatusMessage } from "../definitions/content/BackendStatusMessage";
import { Locales } from "../locales/locales";

import it from "../locales/it/index.json";
import en from "../locales/en/index.json";
import de from "../locales/de/index.json";
import { PreferredLanguageEnum } from "../definitions/session_manager/PreferredLanguage";
import { contentRepoUrl } from "./config";

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

class MergedBackend extends HttpBackend {
  // Il tipo deve essere "backend" per essere riconosciuto da i18next
  constructor(services, options = {}) {
    super(services, options);
  }

  // Sovrascrivi il metodo read per eseguire il merge
  read(language, namespace, callback: ReadCallback) {
    // Richiama il metodo read del backend originale (HttpBackend)
    super.read(language, namespace, (err, remoteData) => {
      // Se c'è un errore (es. file non trovato), usa solo i dati locali
      if (err) {
        if (resources[language] && resources[language][namespace]) {
          callback(null, resources[language][namespace]);
        } else {
          callback(null, {});
        }
        return;
      }

      // Se i dati remoti sono caricati correttamente, esegui il merge
      if (resources[language] && resources[language][namespace]) {
        // Unisci le risorse: le chiavi remote hanno la precedenza
        const mergedData = _.merge(resources[language][namespace], remoteData);
        callback(null, mergedData);
      } else {
        // Se non ci sono risorse locali, usa solo quelle remote
        callback(null, remoteData);
      }
    });
  }
}

export const initI18n = async () =>
  await i18next
    .use(initReactI18next)
    .use(MergedBackend)
    .init<HttpBackendOptions>({
      debug: true,
      lng: "it",
      fallbackLng: "it",
      initAsync: false,
      backend: {
        loadPath: `${contentRepoUrl}/locales/{{lng}}/{{ns}}.json`
      },
      react: {
        useSuspense: true
      },
      interpolation: { escapeValue: false }
    });

export const setLocale = (locale: Locales) => {
  void i18next.changeLanguage(locale);
};
