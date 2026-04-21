import dc from "../../__mocks__/dc.json";
import eid from "../../__mocks__/eid.json";
import dcL3 from "../../__mocks__/L3/dcL3.json";
import edL3 from "../../__mocks__/L3/edL3.json";
import eeL3 from "../../__mocks__/L3/eeL3.json";
import mdlL3 from "../../__mocks__/L3/mdlL3.json";
import resL3 from "../../__mocks__/L3/resL3.json";
import tsL3 from "../../__mocks__/L3/tsL3.json";
import mdl from "../../__mocks__/mdl.json";
import edipL3 from "../../__mocks__/L3/edipL3.json";
import edatL3 from "../../__mocks__/L3/edatL3.json";
import statusAssertion from "../../__mocks__/statusAssertion.json";
import ts from "../../__mocks__/ts.json";
import { DigitalCredentialMetadata } from "./itwCredentialsCatalogueUtils";
import { CredentialMetadata, ParsedStatusAssertion } from "./itwTypesUtils";

export const ISSUER_MOCK_NAME = "Istituto Poligrafico e Zecca dello Stato";

export type CredentialL3Key = keyof typeof ItwStoredCredentialsMocks.L3;

/**
 * Credential types mocks.
 */
export enum CredentialType {
  EUROPEAN_HEALTH_INSURANCE_CARD = "EuropeanHealthInsuranceCard",
  EUROPEAN_DISABILITY_CARD = "EuropeanDisabilityCard",
  DRIVING_LICENSE = "mDL",
  PID = "PersonIdentificationData",
  AGE_VERIFICATION = "age_verification",
  EDUCATION_DEGREE = "education_degree",
  EDUCATION_ENROLLMENT = "education_enrollment",
  RESIDENCY = "residency",
  EDUCATION_DIPLOMA = "education_diploma",
  EDUCATION_ATTENDANCE = "education_attendance"
}

export const ItwStoredCredentialsMocks = {
  eid: eid as unknown as CredentialMetadata,
  dc: dc as unknown as CredentialMetadata,
  mdl: mdl as unknown as CredentialMetadata,
  ts: ts as unknown as CredentialMetadata,
  L3: {
    mdl: mdlL3 as unknown as CredentialMetadata,
    ts: tsL3 as unknown as CredentialMetadata,
    dc: dcL3 as unknown as CredentialMetadata,
    age_verification: {
      credentialType: CredentialType.AGE_VERIFICATION,
      credentialId: CredentialType.AGE_VERIFICATION,
      format: "dc+sd-jwt",
      keyTag: "age-verification-playground",
      jwt: {
        issuedAt: "2026-04-01T10:00:00.000Z",
        expiration: "2026-06-30T10:00:00.000Z"
      },
      spec_version: "1.0.0",
      verification: {
        trust_framework: "it_wallet",
        assurance_level: "high"
      },
      parsedCredential: {
        age_over_18: {
          value: "18+",
          name: {
            "it-IT": "Età certificata",
            "en-US": "Age verification"
          }
        }
      },
      issuerConf: {
        federation_entity: {
          organization_name: ISSUER_MOCK_NAME,
          homepage_uri: "https://pre.eaa.wallet.ipzs.it/1-0",
          policy_uri:
            "https://pre.eaa.wallet.ipzs.it/1-0/public/privacy_policy.html",
          logo_uri: "https://pre.eaa.wallet.ipzs.it/1-0/public/logo.svg",
          contacts: ["informazioni@ipzs.it"],
          tos_uri: "https://pre.eaa.wallet.ipzs.it/1-0/public/info_policy.html"
        },
        credential_configurations_supported: {
          [CredentialType.AGE_VERIFICATION]: {
            authentic_source: "IT-Wallet ID"
          }
        }
      }
    } as unknown as CredentialMetadata,
    ed: edL3 as unknown as CredentialMetadata,
    ee: eeL3 as unknown as CredentialMetadata,
    res: resL3 as unknown as CredentialMetadata,
    edip: edipL3 as unknown as CredentialMetadata,
    edat: edatL3 as unknown as CredentialMetadata
  }
};

export const ItwStatusAssertionMocks = {
  mdl: statusAssertion as ParsedStatusAssertion
};

export const ItwCredentialFromCatalogueMocks: DigitalCredentialMetadata = {
  name: "Tessera Sanitaria Digitale",
  description:
    "Versione Digitale della Tessera Sanitaria - Tessera europea di assicurazione malattia",
  purposes: [],
  version: "1.0",
  credential_type: "EuropeanHealthInsuranceCard",
  legal_type: "pub-eaa",
  validity_info: {
    max_validity_days: 365,
    status_methods: [],
    allowed_states: []
  },
  issuers: [],
  authentic_sources: [
    {
      organization_name: "MEF - Ragioneria Generale dello Stato",
      organization_code: "m_ef",
      id: "https://www.rgs.mef.gov.it",
      organization_country: "IT",
      organization_type: "public"
    }
  ],
  formats: []
};

export const ItwAgeVerificationCredentialFromCatalogueMock: DigitalCredentialMetadata =
  {
    name: "Età certificata",
    description: "Attestazione digitale anonima che certifica la maggiore età.",
    purposes: [],
    version: "1.0",
    credential_type: CredentialType.AGE_VERIFICATION,
    legal_type: "pub-eaa",
    validity_info: {
      max_validity_days: 90,
      status_methods: [],
      allowed_states: []
    },
    issuers: [],
    authentic_sources: [
      {
        organization_name: "IT-Wallet ID",
        organization_code: "it_wallet_id",
        id: "it_wallet_id",
        organization_country: "IT",
        organization_type: "public",
        user_information:
          "### Cos'è\n\nEtà certificata è l'attestazione digitale anonima che certifica la tua maggiore età (in Italia, 18 anni). Contiene solo informazioni sulla tua soglia d'età, nient'altro.\n\n### A cosa serve\n\nTi serve accedere a servizi riservati agli adulti senza condividere dati personali."
      }
    ],
    formats: []
  };
