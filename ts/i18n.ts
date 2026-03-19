import i18next from "i18next";
// import i18next, {
//   BackendModule,
//   InitOptions,
//   ReadCallback,
//   Services
// } from "i18next";
import { initReactI18next } from "react-i18next";

// import { captureException } from "@sentry/react-native";
import { BackendStatusMessage } from "../definitions/content/BackendStatusMessage";

import it from "../locales/it/index.json";
import en from "../locales/en/index.json";
import de from "../locales/de/index.json";
import sl from "../locales/sl/index.json";
import { PreferredLanguageEnum } from "../definitions/session_manager/PreferredLanguage";
// import { newContentRepoUrl } from "./config";

const resources = {
  it: {
    index: it
  },
  en: {
    index: en
  },
  de: {
    index: de
  },
  sl: {
    index: sl
  }
};

// Utility type to extract all possible keys from resources as dot-separated paths
// This provides the same TranslationKeys that i18next uses internally
type ExtractKeys<Obj, Prefix extends string = ""> = {
  [K in keyof Obj]: K extends string | number
    ? Obj[K] extends Record<string, any>
      ? ExtractKeys<Obj[K], Prefix extends "" ? `${K}` : `${Prefix}.${K}`>
      : Prefix extends ""
      ? `${K}`
      : `${Prefix}.${K}`
    : never;
}[keyof Obj];

export type TranslationKeys = ExtractKeys<typeof it>;

export type Locales = keyof typeof resources;

export type LocalizedMessageKeys = keyof BackendStatusMessage;
type FallBackLocale = {
  localizedMessageKey: LocalizedMessageKeys;
  locale: "it";
  localeEnum: PreferredLanguageEnum;
};

const backendSupportedLocales = {
  it: PreferredLanguageEnum.it_IT,
  en: PreferredLanguageEnum.en_GB,
  de: PreferredLanguageEnum.de_DE
} as const satisfies Partial<Record<Locales, PreferredLanguageEnum>>;

export type BackendSupportedLocale = keyof typeof backendSupportedLocales;

export const localeToLocalizedMessageKey: ReadonlyMap<
  Locales,
  LocalizedMessageKeys
> = new Map<BackendSupportedLocale, LocalizedMessageKeys>([
  ["it", "it-IT"],
  ["en", "en-EN"],
  ["de", "de-DE"]
]);

export const localeToPreferredLanguageMapping: ReadonlyMap<
  Locales,
  PreferredLanguageEnum
> = new Map<BackendSupportedLocale, PreferredLanguageEnum>(
  Object.entries(backendSupportedLocales) as Array<
    [BackendSupportedLocale, PreferredLanguageEnum]
  >
);

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
  localResources: typeof resources;
}

// TODO: Enable this backend plugin once the internal process to update translations on a remote source will be in place.
// const DEFAULT_SMART_BACKEND_OPTIONS: SmartBackendOptions = {
//   localResources: resources
// };

// Custom backend plugin for i18next that first loads translations from local resources and then tries to fetch updated translations from a remote repository.
// If the remote fetch fails, it falls back to the local resources without affecting the user experience.
// class SmartI18nextBackend implements BackendModule<SmartBackendOptions> {
//   static type = "backend";
//   type = "backend" as const;

//   services: Services | null = null;
//   options: SmartBackendOptions | null = null;

//   constructor(
//     services: Services,
//     options: SmartBackendOptions = DEFAULT_SMART_BACKEND_OPTIONS
//   ) {
//     this.init(services, options, {});
//   }

//   init(services: Services, options: SmartBackendOptions, _: InitOptions) {
//     // eslint-disable-next-line functional/immutable-data
//     this.services = services;
//     // eslint-disable-next-line functional/immutable-data
//     this.options = options;
//   }

//   read(language: Locales, namespace: "index", callback: ReadCallback) {
//     if (this.options?.localResources[language] === undefined) {
//       callback(null, resources.it[namespace]);
//     } else {
//       const localData = this.options.localResources[language][namespace] || {};
//       callback(null, localData);
//     }
//     void this.loadRemote(language, namespace);
//   }

//   async loadRemote(language: Locales, namespace: string) {
//     try {
//       const url = `${newContentRepoUrl}/locales/${language}/${namespace}.json`;
//       const response = await fetch(url);
//       if (!response.ok) {
//         captureException(
//           new Error(
//             `Failed to load remote translations: ${response.status} ${response.statusText} for ${url}`
//           )
//         );
//         return;
//       }
//       const remoteData = await response.json();

//       i18next.addResourceBundle(language, namespace, remoteData, true, true);
//     } catch (error) {
//       captureException(error);
//     }
//   }
// }

export const initI18n = async () =>
  await i18next
    .use(initReactI18next)
    // .use(SmartI18nextBackend)
    .init({
      lng: "it",
      fallbackLng: "it",
      supportedLngs: availableTranslations,
      initAsync: false,
      ns: ["index"],
      defaultNS: "index",
      react: {
        useSuspense: true
      },
      resources,
      // backend: {
      //   localResources: resources
      // },
      interpolation: { escapeValue: false }
    });

export const setLocale = (locale: Locales) => {
  void i18next.changeLanguage(locale);
};
