import dc from "../../__mocks__/dc.json";
import eid from "../../__mocks__/eid.json";
import avL3 from "../../__mocks__/L3/avL3.json";
import dcL3 from "../../__mocks__/L3/dcL3.json";
import edatL3 from "../../__mocks__/L3/edatL3.json";
import edipL3 from "../../__mocks__/L3/edipL3.json";
import edL3 from "../../__mocks__/L3/edL3.json";
import eeL3 from "../../__mocks__/L3/eeL3.json";
import mdlL3 from "../../__mocks__/L3/mdlL3.json";
import resL3 from "../../__mocks__/L3/resL3.json";
import tsL3 from "../../__mocks__/L3/tsL3.json";
import mdl from "../../__mocks__/mdl.json";
import statusAssertion from "../../__mocks__/statusAssertion.json";
import ts from "../../__mocks__/ts.json";
import { WellKnownClaim } from "./itwClaimsUtils";
import {
  DigitalCredentialMetadata,
  DigitalCredentialsCatalogue
} from "./itwCredentialsCatalogueUtils";
import { CredentialMetadata, ParsedStatusAssertion } from "./itwTypesUtils";

export const ISSUER_MOCK_NAME = "Istituto Poligrafico e Zecca dello Stato";

/** Credential types mocks. */
export enum CredentialType {
  DRIVING_LICENSE = "mDL",
  EDUCATION_ATTENDANCE = "education_attendance",
  EDUCATION_DEGREE = "education_degree",
  EDUCATION_DIPLOMA = "education_diploma",
  EDUCATION_ENROLLMENT = "education_enrollment",
  EUROPEAN_DISABILITY_CARD = "EuropeanDisabilityCard",
  EUROPEAN_HEALTH_INSURANCE_CARD = "EuropeanHealthInsuranceCard",
  /**
   * Internal type used to identify the Person Identification Data credential.
   * It does not distinguish between legacy PID, PID and NPID in order to avoid
   * significant refactoring; use the vct to differentiate between them, if
   * needed. Depending on future use cases, we may create separate credential
   * types for PID and NPID.
   */
  PID = "pid",
  PROOF_OF_AGE = "proof_of_age",
  RESIDENCY = "residency"
}

export type CredentialL3Key = keyof typeof ItwStoredCredentialsMocks.L3;

export const ItwStoredCredentialsMocks = {
  eid: eid as unknown as CredentialMetadata,
  dc: dc as unknown as CredentialMetadata,
  mdl: mdl as unknown as CredentialMetadata,
  ts: ts as unknown as CredentialMetadata,
  L3: {
    mdl: mdlL3 as unknown as CredentialMetadata,
    ts: tsL3 as unknown as CredentialMetadata,
    dc: dcL3 as unknown as CredentialMetadata,
    proofOfAge: avL3 as unknown as CredentialMetadata,
    ed: edL3 as unknown as CredentialMetadata,
    ee: eeL3 as unknown as CredentialMetadata,
    res: resL3 as unknown as CredentialMetadata,
    edip: edipL3 as unknown as CredentialMetadata,
    edat: edatL3 as unknown as CredentialMetadata
  }
};

export const ITW_ISSUING_AUTHORITY_CLAIM_MOCK_LABEL = "Mock issuing authority";

/**
 * Adds the `issuing_authority` claim provided by IPZS to the given credential.
 * The claim label is the same for every locale, so tests can query it
 * regardless of the current language.
 */
export const withIssuingAuthorityClaimMock = (
  credential: CredentialMetadata
): CredentialMetadata => ({
  ...credential,
  parsedCredential: {
    ...credential.parsedCredential,
    [WellKnownClaim.issuing_authority]: {
      value: "Istituto Poligrafico e Zecca dello Stato",
      name: {
        "it-IT": ITW_ISSUING_AUTHORITY_CLAIM_MOCK_LABEL,
        "en-US": ITW_ISSUING_AUTHORITY_CLAIM_MOCK_LABEL
      }
    }
  }
});

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

/**
 * Digital Credentials Catalogue mock with all the credentials obtainable in the
 * app, built from {@link ItwCredentialFromCatalogueMocks}.
 */
export const ItwCredentialsCatalogueMock: DigitalCredentialsCatalogue = {
  taxonomy_uri: "https://example.com/taxonomy",
  iat: 1700000000,
  exp: 4102444800,
  credentials: [
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    CredentialType.PROOF_OF_AGE,
    CredentialType.EDUCATION_DEGREE,
    CredentialType.EDUCATION_ENROLLMENT,
    CredentialType.RESIDENCY,
    CredentialType.EDUCATION_DIPLOMA,
    CredentialType.EDUCATION_ATTENDANCE
  ].map(credential_type => ({
    ...ItwCredentialFromCatalogueMocks,
    credential_type
  }))
};
