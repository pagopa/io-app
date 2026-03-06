import dc from "../../__mocks__/dc.json";
import eid from "../../__mocks__/eid.json";
import dcL3 from "../../__mocks__/L3/dcL3.json";
import edL3 from "../../__mocks__/L3/edL3.json";
import eeL3 from "../../__mocks__/L3/eeL3.json";
import mdlL3 from "../../__mocks__/L3/mdlL3.json";
import resL3 from "../../__mocks__/L3/resL3.json";
import tsL3 from "../../__mocks__/L3/tsL3.json";
import mdl from "../../__mocks__/mdl.json";
import statusAssertion from "../../__mocks__/statusAssertion.json";
import ts from "../../__mocks__/ts.json";
import { DigitalCredentialMetadata } from "./itwCredentialsCatalogueUtils";
import { ParsedStatusAssertion, CredentialMetadata } from "./itwTypesUtils";

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
  EDUCATION_DEGREE = "education_degree",
  EDUCATION_ENROLLMENT = "education_enrollment",
  RESIDENCY = "residency"
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
    ed: edL3 as unknown as CredentialMetadata,
    ee: eeL3 as unknown as CredentialMetadata,
    res: resL3 as unknown as CredentialMetadata
  }
};

export const ItwStatusAssertionMocks = {
  mdl: statusAssertion as ParsedStatusAssertion
};

export const ItwCredentialFromCatalogueMocks: DigitalCredentialMetadata = {
  name: "Tessera Sanitaria Digitale",
  description:
    "Versione Digitale della Tessera Sanitaria - Tessera europea di assicurazione malattia",
  claims: [],
  purposes: [],
  version: "1.0",
  credential_type: "EuropeanHealthInsuranceCard",
  legal_type: "pub-eaa",
  validity_info: {
    max_validity_days: 365,
    status_methods: [],
    allowed_states: []
  },
  authentication: {
    user_auth_required: true,
    min_loa: "high",
    supported_eid_schemes: ["it_wallet"]
  },
  issuers: [],
  authentic_sources: [
    {
      organization_name: "MEF - Ragioneria Generale dello Stato",
      organization_code: "m_ef",
      id: "https://www.rgs.mef.gov.it",
      organization_country: "IT",
      source_type: "public"
    }
  ],
  formats: []
};
