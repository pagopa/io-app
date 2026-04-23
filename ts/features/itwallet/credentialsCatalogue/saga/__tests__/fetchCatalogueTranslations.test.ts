import * as pot from "@pagopa/ts-commons/lib/pot";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { type DeepPartial } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { fetchCatalogueTranslationsSaga } from "../fetchCatalogueTranslations";
import { fetchCatalogueTranslations } from "../../../common/utils/itwCredentialsCatalogueUtils";
import { itwFetchCatalogueTranslations } from "../../store/actions";

const mockCatalogue = {
  taxonomy_uri: "",
  exp: 1700000000,
  iat: 1600000000,
  credentials: [],
  localization: {
    available_locales: ["it", "en"],
    base_uri: "https://example.com/locales",
    default_locale: "it",
    version: "1"
  }
};

const mockTranslations = {
  it: { "cred.name": "Nome" },
  en: { "cred.name": "Name" }
};

describe("fetchCatalogueTranslationsSaga", () => {
  const baseStore: DeepPartial<GlobalState> = {
    features: {
      itWallet: {
        credentialsCatalogue: {
          catalogue: pot.some(mockCatalogue),
          translations: pot.none,
          isEnabledForCredentialsList: false
        },
        environment: {
          env: "pre",
          itWalletSpecsVersion: "1.3.3"
        }
      }
    },
    persistedPreferences: { preferredLanguage: "it" }
  };

  it("should fetch translations and dispatch success for v1.3.3", () =>
    expectSaga(fetchCatalogueTranslationsSaga)
      .withState(baseStore)
      .provide([
        [matchers.call.fn(fetchCatalogueTranslations), mockTranslations]
      ])
      .put(itwFetchCatalogueTranslations.request())
      .put(itwFetchCatalogueTranslations.success(mockTranslations))
      .run());

  it("should dispatch failure when fetchCatalogueTranslations throws", () =>
    expectSaga(fetchCatalogueTranslationsSaga)
      .withState(baseStore)
      .provide([
        [
          matchers.call.fn(fetchCatalogueTranslations),
          throwError(new Error("network error"))
        ]
      ])
      .put(itwFetchCatalogueTranslations.request())
      .put.actionType(itwFetchCatalogueTranslations.failure.toString())
      .run());

  it("should dispatch success with empty translations for v1.0.0 (library returns {} when fetchTranslations is unavailable)", () => {
    const v1Store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          credentialsCatalogue: {
            catalogue: pot.some(mockCatalogue),
            translations: pot.none,
            isEnabledForCredentialsList: false
          },
          environment: {
            env: "prod",
            itWalletSpecsVersion: "1.0.0"
          }
        }
      },
      persistedPreferences: { preferredLanguage: "it" }
    };
    return expectSaga(fetchCatalogueTranslationsSaga)
      .withState(v1Store)
      .provide([[matchers.call.fn(fetchCatalogueTranslations), {}]])
      .put(itwFetchCatalogueTranslations.request())
      .put(itwFetchCatalogueTranslations.success({}))
      .run();
  });

  it("should be a no-op when catalogue is not yet available", () => {
    const noCatalogueStore: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          credentialsCatalogue: {
            catalogue: pot.none,
            translations: pot.none,
            isEnabledForCredentialsList: false
          },
          environment: {
            env: "pre",
            itWalletSpecsVersion: "1.3.3"
          }
        }
      },
      persistedPreferences: { preferredLanguage: "it" }
    };
    return expectSaga(fetchCatalogueTranslationsSaga)
      .withState(noCatalogueStore)
      .not.put(itwFetchCatalogueTranslations.request())
      .not.call.fn(fetchCatalogueTranslations)
      .run();
  });
});
