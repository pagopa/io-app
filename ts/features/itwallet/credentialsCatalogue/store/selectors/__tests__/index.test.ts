import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { type GlobalState } from "../../../../../../store/reducers/types";
import { DigitalCredentialsCatalogue } from "../../../../common/utils/itwCredentialsCatalogueUtils";
import {
  itwAvailableCredentialsListSelector,
  itwCatalogueTranslationsByLocaleSelector,
  itwCredentialsCatalogueByTypesSelector
} from "..";

const mockCatalogue = {
  taxonomy_uri: "",
  exp: 1700000000,
  iat: 1600000000,
  credentials: [
    {
      credential_type: "cred1",
      name: "Credential 1",
      description: "Description for Credential 1"
    },
    {
      credential_type: "cred2",
      name: "Credential 2",
      name_l10n_id: "cred2.name",
      description: "Description for Credential 2"
    }
  ] as DigitalCredentialsCatalogue["credentials"]
};

const buildState = (
  overrides: Partial<{
    isEnabledForCredentialsList: boolean;
    catalogue: pot.Pot<DigitalCredentialsCatalogue, unknown>;
    translations: pot.Pot<Record<string, Record<string, string>>, unknown>;
    preferredLanguage: string;
  }> = {}
) =>
  ({
    features: {
      itWallet: {
        credentialsCatalogue: {
          isEnabledForCredentialsList:
            overrides.isEnabledForCredentialsList ?? false,
          catalogue: overrides.catalogue ?? pot.none,
          translations: overrides.translations ?? pot.none
        },
        // Required by itwLifecycleIsITWalletValidSelector, transitively used
        // by itwCredentialNameResolverSelector.
        issuance: { integrityKeyTag: { _tag: "None" } },
        credentials: { credentials: {} },
        preferences: {
          isFiscalCodeWhitelisted: false,
          isItwSimplifiedActivationRequired: false
        }
      }
    },
    remoteConfig: O.none,
    persistedPreferences: {
      preferredLanguage:
        overrides.preferredLanguage !== undefined
          ? overrides.preferredLanguage
          : "it"
    }
  }) as unknown as GlobalState;

describe("itwCredentialsCatalogueByTypesSelector", () => {
  it("should return a dictionary mapping credential types to their metadata", () => {
    const state = buildState({ catalogue: pot.some(mockCatalogue) });

    expect(itwCredentialsCatalogueByTypesSelector(state)).toEqual({
      cred1: {
        credential_type: "cred1",
        name: "Credential 1",
        description: "Description for Credential 1"
      },
      cred2: {
        credential_type: "cred2",
        name: "Credential 2",
        name_l10n_id: "cred2.name",
        description: "Description for Credential 2"
      }
    });
  });
});

describe("itwCatalogueTranslationsByLocaleSelector", () => {
  it("should return undefined when translations are not available", () => {
    expect(
      itwCatalogueTranslationsByLocaleSelector(buildState())
    ).toBeUndefined();
  });

  it("should return the flat translation map for the current locale", () => {
    const state = buildState({
      translations: pot.some({
        it: { "cred2.name": "Credenziale 2" },
        en: { "cred2.name": "Credential 2 EN" }
      }),
      preferredLanguage: "it"
    });
    expect(itwCatalogueTranslationsByLocaleSelector(state)).toEqual({
      "cred2.name": "Credenziale 2"
    });
  });

  it("should return the correct locale when preferred language is 'en'", () => {
    const state = buildState({
      translations: pot.some({
        it: { "cred2.name": "Credenziale 2" },
        en: { "cred2.name": "Credential 2 EN" }
      }),
      preferredLanguage: "en"
    });
    expect(itwCatalogueTranslationsByLocaleSelector(state)).toEqual({
      "cred2.name": "Credential 2 EN"
    });
  });
});

describe("itwAvailableCredentialsListSelector", () => {
  it("should return the list of credentials from the catalogue when it is enabled", () => {
    const state = buildState({
      isEnabledForCredentialsList: true,
      catalogue: pot.some(mockCatalogue)
    });

    expect(itwAvailableCredentialsListSelector(state)).toEqual([
      { type: "cred1", name: "Credential 1" },
      { type: "cred2", name: "Credential 2" }
    ]);
  });

  it("should resolve name_l10n_id from translations when available", () => {
    const state = buildState({
      isEnabledForCredentialsList: true,
      catalogue: pot.some(mockCatalogue),
      translations: pot.some({ it: { "cred2.name": "Credenziale 2" } }),
      preferredLanguage: "it"
    });

    expect(itwAvailableCredentialsListSelector(state)).toEqual([
      { type: "cred1", name: "Credential 1" },
      { type: "cred2", name: "Credenziale 2" }
    ]);
  });

  it("should fall back to static name when l10n_id is missing from translations", () => {
    const state = buildState({
      isEnabledForCredentialsList: true,
      catalogue: pot.some(mockCatalogue),
      translations: pot.some({ it: {} }),
      preferredLanguage: "it"
    });

    expect(itwAvailableCredentialsListSelector(state)).toEqual([
      { type: "cred1", name: "Credential 1" },
      { type: "cred2", name: "Credential 2" }
    ]);
  });

  it("should return the list of hardcoded credentials when the catalogue is not enabled", () => {
    const state = buildState({
      isEnabledForCredentialsList: false,
      catalogue: pot.some(mockCatalogue)
    });

    expect(itwAvailableCredentialsListSelector(state)).toEqual([
      { name: "Patente di guida", type: "mDL" },
      {
        name: "Carta Europea della Disabilità",
        type: "EuropeanDisabilityCard"
      },
      {
        name: "Tessera Sanitaria - Tessera europea di assicurazione malattia",
        type: "EuropeanHealthInsuranceCard"
      },
      { name: "Titoli accademici", type: "education_degree" },
      { name: "Iscrizioni accademiche", type: "education_enrollment" },
      { name: "Attestato di residenza", type: "residency" },
      { name: "Diplomi", type: "education_diploma" },
      { name: "Frequenza scolastica", type: "education_attendance" }
    ]);
  });
});
