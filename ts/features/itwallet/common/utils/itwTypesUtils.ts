import {
  SdJwt,
  WalletInstance,
  RemotePresentation,
  CredentialStatus,
  CredentialIssuance,
  CredentialOffer
} from "@pagopa/io-react-native-wallet";
import { CredentialType } from "./itwMocksUtils.ts";

/**
 * Alias for RequestObject
 */
export type RequestObject = RemotePresentation.RequestObject;

/**
 * Alias type for the relying party entity configuration.
 */
export type RpEntityConfiguration = RemotePresentation.RelyingPartyConfig;

/**
 * Alias for the IssuerConfiguration type
 */
export type IssuerConfiguration = CredentialIssuance.IssuerConfig;

/**
 * Alias for the SupportedCredentialConfiguration type
 */
export type MdocSupportedCredentialConfiguration = Extract<
  IssuerConfiguration["credential_configurations_supported"][string],
  { format: "mso_mdoc" }
>;

/**
 * Alias for the AccessToken type
 */
export type CredentialAccessToken = Awaited<
  ReturnType<CredentialIssuance.IssuanceApi["authorizeAccess"]>
>["accessToken"];

/**
 * Alias for the ParseCredential type
 */
export type ParsedCredential = CredentialIssuance.ParsedCredential;

/**
 * Alias for the ParsedStatusAssertion type
 */
export type ParsedStatusAssertion = CredentialStatus.ParsedStatusAssertion;
/**
 * Alias for the WalletInstanceStatus type
 */
export type WalletInstanceStatus = WalletInstance.WalletInstanceStatus;

/**
 * Alias for the WalletInstanceRevocationReason type
 */
export type WalletInstanceRevocationReason =
  WalletInstanceStatus["revocation_reason"];

/**
 * Alias for the Verification type
 */
export type Verification = NonNullable<
  ReturnType<typeof SdJwt.getVerification>
>;

/**
 * Slim version of Verification for storage.
 * Only persists the fields actually used by the app.
 * The `evidence` field is excluded as it's being dropped in spec v1.3.3.
 */
export type StoredVerification = Pick<
  Verification,
  "trust_framework" | "assurance_level"
>;

export type StoredStatusAssertion =
  | {
      credentialStatus: "valid";
      statusAssertion: string;
      parsedStatusAssertion: ParsedStatusAssertion;
    }
  | {
      credentialStatus: "invalid" | "unknown";
      // Error code that might contain more details on the invalid status, provided by the issuer
      errorCode?: string;
    };

/**
 * Type for a stored credential.
 */
export type StoredCredential = {
  keyTag: string;
  credential: string;
  format: string;
  parsedCredential: ParsedCredential;
  credentialType: string;
  credentialId: string;
  issuerConf: IssuerConfiguration;
  storedStatusAssertion?: StoredStatusAssertion;
  /**
   * The SD-JWT issuance and expiration dates in ISO format.
   * These might be different from the underlying document's dates.
   */
  // TODO: [SIW-2740] This type needs to be rafactored once mdoc format will be available
  jwt: {
    expiration: string;
    issuedAt?: string;
  };
  spec_version: string;
  verification?: StoredVerification;
};

// Digital credential status
export type ItwJwtCredentialStatus = "valid" | "jwtExpired" | "jwtExpiring";
// Combined status of a credential, that includes both the physical and the digital version
export type ItwCredentialStatus =
  | "unknown"
  | "valid"
  | "invalid"
  | "expiring"
  | "expired"
  | ItwJwtCredentialStatus;

export type ItwAuthLevel = "L2" | "L3";

export const enum CredentialFormat {
  MDOC = "mso_mdoc",
  SD_JWT = "dc+sd-jwt",
  LEGACY_SD_JWT = "vc+sd-jwt"
}

export type WalletInstanceAttestations = {
  jwt: string;
  [CredentialFormat.SD_JWT]?: string;
  [CredentialFormat.MDOC]?: string;
};

export type CredentialOfferResolved = {
  offer: CredentialOffer.CredentialOffer;
  grantDetails: CredentialOffer.ExtractGrantDetailsResult;
};

// A predefined list of credential types that are potentially multi-level.
const MULTI_LEVEL_CREDENTIAL_TYPES = [
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT
];

/**
 * Checks if a given credential is "multi-level".
 * A credential is multi-level if its type is in a predefined list
 * and its parsed data contains at least one claim that is an array
 * with more than one item.
 *
 * @param credential the stored credential to check.
 * @returns `true` if the credential is multi-level, `false` otherwise.
 */
export const isMultiLevelCredential = (
  credential: StoredCredential
): boolean => {
  const { credentialType, parsedCredential } = credential;
  const isMultiLevel = MULTI_LEVEL_CREDENTIAL_TYPES.includes(
    credentialType as CredentialType
  );

  if (!isMultiLevel || !parsedCredential) {
    return false;
  }

  return Object.values(parsedCredential).some(
    claim => Array.isArray(claim.value) && claim.value.length > 1
  );
};
