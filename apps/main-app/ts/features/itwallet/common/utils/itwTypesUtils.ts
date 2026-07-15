import {
  CredentialIssuance,
  CredentialOffer,
  CredentialStatus,
  RemotePresentation,
  SdJwt,
  WalletInstance
} from "@pagopa/io-react-native-wallet";

import { CredentialType } from "./itwMocksUtils.ts";

export const enum CredentialFormat {
  LEGACY_SD_JWT = "vc+sd-jwt",
  MDOC = "mso_mdoc",
  SD_JWT = "dc+sd-jwt"
}

/**
 * Alias for the AccessToken type
 */
export type CredentialAccessToken = Awaited<
  ReturnType<CredentialIssuance.IssuanceApi["authorizeAccess"]>
>["accessToken"];

/**
 * Credentials's metadata along with the cryptographic material.
 * Represents the type for the output of the credential issuance process before it is stored.
 * Conveniently splitted in two parts for easier handling and storage optimization.
 */
export type CredentialBundle = {
  /**
   * The credential's cryptographic material in SD-JWT/MDOC format.
   */
  credential: string;

  /**
   * The credential's metadata for UI rendering and management.
   */
  metadata: CredentialMetadata;
};

/**
 * Credential's metadata for UI rendering and management.
 * Represents the type for the stored credentials in the wallet.
 * Does not include the actual credential cryptographic material.
 */
export type CredentialMetadata = {
  credentialId: string;
  credentialType: string;
  format: string;
  issuerConf: IssuerConfiguration;
  /**
   * The SD-JWT issuance and expiration dates in ISO format.
   * These might be different from the underlying document's dates.
   */
  // TODO: [SIW-2740] This type needs to be rafactored once mdoc format will be available
  jwt: {
    expiration: string;
    issuedAt?: string;
  };
  keyTag: string;
  /**
   * Key tags of every copy of a batch credential (e.g. one-time-use credentials obtained in
   * batch). Present only for batch credentials; non-batch credentials omit it. The array is the
   * source of truth for the batch and `keyTags[0]` is the representative copy, mirrored by
   * `keyTag` so existing single-credential consumers keep working. The raw bytes of each copy are
   * stored in {@link CredentialsVault} under that copy's `keyTag` as vault id.
   */
  keyTags?: ReadonlyArray<string>;
  parsedCredential: ParsedCredential;
  spec_version: string;
  storedStatusAssertion?: StoredStatusAssertion;
  verification?: StoredVerification;
  /**
   * The ID of the Wallet Unit Attestation that contains the credential attested key.
   * The corresponding attestation is stored in `walletInstace.walletUnitAttestations`.
   * Only credentials issued with the newer IT-Wallet specs contain this field.
   */
  walletUnitAttestationId?: string;
};

export type CredentialOfferResolved = {
  grantDetails: CredentialOffer.ExtractGrantDetailsResult;
  offer: CredentialOffer.CredentialOffer;
};

/**
 * Alias for the result of evaluating a DCQL query against local credentials.
 */
export type EvaluatedDcqlQueryResult = Awaited<
  ReturnType<RemotePresentation.RemotePresentationApi["evaluateDcqlQuery"]>
>;

/**
 * Alias for the IssuerConfiguration type
 */
export type IssuerConfiguration = CredentialIssuance.IssuerConfig;

export type ItwAuthLevel = "L2" | "L3";
// Combined status of a credential, that includes both the physical and the digital version
export type ItwCredentialStatus =
  | "expired"
  | "expiring"
  | "invalid"
  | "unknown"
  | "valid"
  | ItwJwtCredentialStatus;

// Digital credential status
export type ItwJwtCredentialStatus = "jwtExpired" | "jwtExpiring" | "valid";

/**
 * Alias for the SupportedCredentialConfiguration type
 */
export type MdocSupportedCredentialConfiguration = Extract<
  IssuerConfiguration["credential_configurations_supported"][string],
  { format: "mso_mdoc" }
>;

/**
 * Alias for the ParseCredential type
 */
export type ParsedCredential = CredentialIssuance.ParsedCredential;

/**
 * Alias for the ParsedStatusAssertion type
 */
export type ParsedStatusAssertion = CredentialStatus.ParsedStatusAssertion;

/**
 * Alias for RequestObject
 */
export type RequestObject = RemotePresentation.RequestObject;

/**
 * Alias type for the relying party entity configuration.
 */
export type RpEntityConfiguration = RemotePresentation.RelyingPartyConfig;

export type StoredStatusAssertion =
  | {
      credentialStatus: "invalid" | "unknown";
      // Error code that might contain more details on the invalid status, provided by the issuer
      errorCode?: string;
    }
  | {
      credentialStatus: "valid";
      parsedStatusAssertion: ParsedStatusAssertion;
      statusAssertion: string;
    };
/**
 * Slim version of Verification for storage.
 * Only persists the fields actually used by the app.
 * The `evidence` field is excluded as it's being dropped in spec v1.3.3.
 */
export type StoredVerification = Pick<
  Verification,
  "assurance_level" | "trust_framework"
>;

/**
 * Alias for the Verification type
 */
export type Verification = NonNullable<
  ReturnType<typeof SdJwt.getVerification>
>;

export type WalletInstanceAttestations = {
  [CredentialFormat.MDOC]?: string;
  [CredentialFormat.SD_JWT]?: string;
  jwt: string;
};

/**
 * Alias for the WalletInstanceRevocationReason type
 */
export type WalletInstanceRevocationReason =
  WalletInstanceStatus["revocation_reason"];

/**
 * Alias for the WalletInstanceStatus type
 */
export type WalletInstanceStatus = WalletInstance.WalletInstanceStatus;

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
  credential: CredentialMetadata
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
