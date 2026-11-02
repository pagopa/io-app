import * as pot from "@pagopa/ts-commons/lib/pot";

import {
  itwAvailableCredentialsListSelector,
  itwCatalogueTranslationsByLocaleSelector,
  itwCredentialIntroContentSelector,
  itwCredentialNameResolverSelector,
  itwCredentialsCatalogueByTypesSelector,
  itwCredentialsCatalogueSelector,
  itwCredentialTypeFromDocTypeSelector
} from "..";
import { type GlobalState } from "../../../../../../store/reducers/types";
import { pidScopes } from "../../../../common/utils/constants";
import { type DigitalCredentialsCatalogue } from "../../../../common/utils/itwCredentialsCatalogueUtils";
import { getCredentialNameFromType } from "../../../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";

const mockCatalogue = {
  taxonomy_uri: "",
  exp: 1700000000,
  iat: 1600000000,
  credentials: [
    {
      credential_type: "cred1",
      name: "Credential 1",
      description: "Description for Credential 1",
      authentic_sources: [
        { id: "as-1", user_information_l10n_id: "as-1.userinfo" }
      ]
    },
    {
      credential_type: "cred2",
      name: "Credential 2",
      name_l10n_id: "cred2.name",
      description: "Description for Credential 2",
      authentic_sources: [{ id: "as-2" }]
    }
  ] as DigitalCredentialsCatalogue["credentials"]
};

const buildState = (
  overrides: Partial<{
    catalogue: pot.Pot<DigitalCredentialsCatalogue, unknown>;
    preferredLanguage: string;
    remoteConfig: {
      hidden_credentials?: ReadonlyArray<string>;
      new_credentials?: ReadonlyArray<string>;
      pinned_credentials?: ReadonlyArray<string>;
    };
    translations: pot.Pot<Record<string, Record<string, string>>, unknown>;
  }> = {}
) =>
  ({
    features: {
      itWallet: {
        remoteConfig: overrides.remoteConfig ?? {},
        credentialsCatalogue: {
          catalogue: overrides.catalogue ?? pot.none,
          translations: overrides.translations ?? pot.none
        },
        // Required by itwLifecycleIsITWalletValidSelector, transitively used
        // by itwCredentialNameResolverSelector.
        issuance: { integrityKeyTag: { _tag: "None" } },
        credentials: { credentials: {} },
        preferences: {
          isFiscalCodeWhitelisted: false
        }
      }
    },
    persistedPreferences: {
      preferredLanguage:
        overrides.preferredLanguage !== undefined
          ? overrides.preferredLanguage
          : "it"
    }
  }) as unknown as GlobalState;

describe("itwCredentialsCatalogueSelector", () => {
  it.each(pidScopes)(
    "should map the PID scope '%s' to credential type 'pid'",
    scope => {
      const state = buildState({
        catalogue: pot.some({
          credentials: [
            { credential_type: scope, name: "PID" },
            { credential_type: "other", name: "Other Credential" }
          ]
        } as DigitalCredentialsCatalogue)
      });

      expect(itwCredentialsCatalogueSelector(state)?.credentials).toEqual([
        { credential_type: "pid", name: "PID" },
        { credential_type: "other", name: "Other Credential" }
      ]);
    }
  );
});

describe("itwCredentialsCatalogueByTypesSelector", () => {
  it("should return a dictionary mapping credential types to their metadata", () => {
    const state = buildState({ catalogue: pot.some(mockCatalogue) });

    expect(itwCredentialsCatalogueByTypesSelector(state)).toEqual({
      cred1: {
        credential_type: "cred1",
        name: "Credential 1",
        description: "Description for Credential 1",
        authentic_sources: [
          { id: "as-1", user_information_l10n_id: "as-1.userinfo" }
        ]
      },
      cred2: {
        credential_type: "cred2",
        name: "Credential 2",
        name_l10n_id: "cred2.name",
        description: "Description for Credential 2",
        authentic_sources: [{ id: "as-2" }]
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

describe("itwCredentialTypeFromDocTypeSelector", () => {
  const docType = "org.iso.18013.5.1.cred2";
  const catalogue = {
    ...mockCatalogue,
    credentials: [
      {
        ...mockCatalogue.credentials[1],
        formats: [
          {
            configuration_id: "dc_sd_jwt_cred2",
            format: "dc+sd-jwt"
          },
          {
            configuration_id: "mso_mdoc_cred2",
            format: "mso_mdoc",
            docType
          }
        ]
      }
    ]
  } as DigitalCredentialsCatalogue;

  it("should return the credential type matching the docType", () => {
    const state = buildState({
      catalogue: pot.some(catalogue)
    });

    expect(itwCredentialTypeFromDocTypeSelector(state)(docType)).toBe("cred2");
  });

  it("should return undefined when the docType is not found", () => {
    const state = buildState({
      catalogue: pot.some(catalogue)
    });

    expect(
      itwCredentialTypeFromDocTypeSelector(state)("unknown-doc-type")
    ).toBeUndefined();
  });

  it("should return undefined when the docType is undefined", () => {
    const state = buildState({
      catalogue: pot.some(catalogue)
    });

    expect(
      itwCredentialTypeFromDocTypeSelector(state)(undefined)
    ).toBeUndefined();
  });
});

describe("itwCredentialNameResolverSelector", () => {
  type Scenario = {
    credentialType: string;
    expected: string;
    name: string;
    translations: Record<string, string>;
    withDefault?: string;
  };

  it.each<Scenario>([
    {
      name: "the translated catalogue name",
      credentialType: "cred2",
      translations: { "cred2.name": "Credenziale 2" },
      expected: "Credenziale 2"
    },
    {
      name: "the static catalogue name when the translation is missing",
      credentialType: "cred2",
      translations: {},
      expected: "Credential 2"
    },
    {
      name: "the hardcoded name when the type is not in the catalogue",
      credentialType: CredentialType.DRIVING_LICENSE,
      translations: {},
      expected: getCredentialNameFromType(CredentialType.DRIVING_LICENSE)
    },
    {
      name: "the default when the type is unknown",
      credentialType: "unknown_type",
      translations: {},
      withDefault: "Default name",
      expected: "Default name"
    }
  ])(
    "should resolve $name",
    ({ credentialType, translations, withDefault, expected }) => {
      const state = buildState({
        catalogue: pot.some(mockCatalogue),
        translations: pot.some({ it: translations })
      });

      expect(
        itwCredentialNameResolverSelector(state)(credentialType, withDefault)
      ).toBe(expected);
    }
  );

  it("should use the hardcoded name when the catalogue is unavailable", () => {
    const state = buildState({
      translations: pot.some({ it: { "cred2.name": "Credenziale 2" } })
    });

    expect(itwCredentialNameResolverSelector(state)("cred2", "Fallback")).toBe(
      "Fallback"
    );
  });
});

describe("itwAvailableCredentialsListSelector", () => {
  it("should return the list of credentials from the catalogue", () => {
    const state = buildState({
      catalogue: pot.some(mockCatalogue)
    });

    expect(itwAvailableCredentialsListSelector(state)).toEqual([
      { type: "cred1", name: "Credential 1" },
      { type: "cred2", name: "Credential 2" }
    ]);
  });

  it("should resolve name_l10n_id from translations when available", () => {
    const state = buildState({
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
      catalogue: pot.some(mockCatalogue),
      translations: pot.some({ it: {} }),
      preferredLanguage: "it"
    });

    expect(itwAvailableCredentialsListSelector(state)).toEqual([
      { type: "cred1", name: "Credential 1" },
      { type: "cred2", name: "Credential 2" }
    ]);
  });

  it("should filter and order catalogue credentials using remote config", () => {
    const state = buildState({
      catalogue: pot.some({
        ...mockCatalogue,
        credentials: [
          ...mockCatalogue.credentials,
          { credential_type: pidScopes[0], name: "PID" },
          { credential_type: "cred3", name: "Credential 3" },
          { credential_type: "cred4", name: "Credential 4" }
        ] as DigitalCredentialsCatalogue["credentials"]
      }),
      remoteConfig: {
        new_credentials: ["cred2", "cred3", "unknown"],
        pinned_credentials: ["cred1", "cred2", "cred3"],
        hidden_credentials: ["cred3"]
      }
    });

    expect(itwAvailableCredentialsListSelector(state)).toEqual([
      { type: "cred2", name: "Credential 2" },
      { type: "cred1", name: "Credential 1" },
      { type: "cred4", name: "Credential 4" }
    ]);
  });

  it("should return the list of hardcoded credentials when the catalogue is unavailable", () => {
    expect(itwAvailableCredentialsListSelector(buildState())).toEqual(
      [
        CredentialType.DRIVING_LICENSE,
        CredentialType.EUROPEAN_DISABILITY_CARD,
        CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
        CredentialType.PROOF_OF_AGE,
        CredentialType.EDUCATION_DEGREE,
        CredentialType.EDUCATION_ENROLLMENT,
        CredentialType.RESIDENCY,
        CredentialType.EDUCATION_DIPLOMA,
        CredentialType.EDUCATION_ATTENDANCE
      ].map(type => ({ type, name: getCredentialNameFromType(type) }))
    );
  });

  it("should filter and order hardcoded credentials using remote config when the catalogue is unavailable", () => {
    const state = buildState({
      remoteConfig: {
        new_credentials: [
          "EuropeanHealthInsuranceCard",
          "proof_of_age",
          "residency"
        ],
        pinned_credentials: [
          "mDL",
          "EuropeanHealthInsuranceCard",
          "education_degree"
        ],
        hidden_credentials: [
          "proof_of_age",
          "education_degree",
          "EuropeanDisabilityCard"
        ]
      }
    });

    expect(
      itwAvailableCredentialsListSelector(state).map(({ type }) => type)
    ).toEqual([
      "EuropeanHealthInsuranceCard",
      "residency",
      "mDL",
      "education_enrollment",
      "education_diploma",
      "education_attendance"
    ]);
  });
});

describe("itwCredentialIntroContentSelector", () => {
  it("should extracted the translated user_information_l10n_id", () => {
    const state = buildState({
      catalogue: pot.some(mockCatalogue),
      translations: pot.some({
        it: { "as-1.userinfo": "New credential 2026" }
      })
    });
    expect(itwCredentialIntroContentSelector("cred1")(state)).toEqual(
      "New credential 2026"
    );
  });

  it("should extract user_information as is", () => {
    const state = buildState({
      catalogue: pot.some({
        credentials: [
          {
            credential_type: "cred1",
            name: "Credential 1",
            description: "Description for Credential 1",
            authentic_sources: [
              { id: "as-1", user_information: "Legacy credential" }
            ]
          }
        ]
      } as DigitalCredentialsCatalogue)
    });
    expect(itwCredentialIntroContentSelector("cred1")(state)).toEqual(
      "Legacy credential"
    );
  });

  it("should return undefined when no user information is present", () => {
    const state = buildState({
      catalogue: pot.some(mockCatalogue)
    });
    expect(itwCredentialIntroContentSelector("cred2")(state)).toEqual(
      undefined
    );
  });
});
