import { type Credential as LegacyCredential } from "@pagopa/io-react-native-wallet-legacy";
import {
  Credential,
  Trust,
  WalletInstance
} from "@pagopa/io-react-native-wallet";
import { CredentialType } from "./itwMocksUtils.ts";

/**
 * Alias type for the return type of the start issuance flow operation.
 */
export type StartIssuanceFlow = Awaited<
  ReturnType<Credential.Issuance.StartFlow>
>;

/** Alias for RequestObject
 * It is not exposed from the wallet package, so we extract the type
 * from the operation description.
 * Consider add the type into the package public interface
 */
export type RequestObject = Awaited<
  ReturnType<Credential.Presentation.VerifyRequestObject>
>["requestObject"];

/**
 * Alias type for the relying party entity configuration.
 */
export type RpEntityConfiguration =
  Trust.Types.RelyingPartyEntityConfiguration["payload"]["metadata"];

/**
 * Alias for the IssuerConfiguration type v0.7.1
 */
export type LegacyIssuerConfiguration = Awaited<
  ReturnType<LegacyCredential.Issuance.EvaluateIssuerTrust>
>["issuerConf"];

/**
 * Alias for the IssuerConfiguration type
 */
export type IssuerConfiguration = Awaited<
  ReturnType<Credential.Issuance.EvaluateIssuerTrust>
>["issuerConf"];

/**
 * Alias for the SupportedCredentialConfiguration type
 */
export type MdocSupportedCredentialConfiguration = Extract<
  IssuerConfiguration["openid_credential_issuer"]["credential_configurations_supported"][string],
  { format: "mso_mdoc" }
>;

/**
 * Alias for the AccessToken type
 */
export type CredentialAccessToken = Awaited<
  ReturnType<Credential.Issuance.AuthorizeAccess>
>["accessToken"];

/**
 * Alias for the ParseCredential type
 */
export type ParsedCredential = Awaited<
  ReturnType<Credential.Issuance.VerifyAndParseCredential>
>["parsedCredential"];

/**
 * Alias for the ParsedStatusAssertion type
 */
export type ParsedStatusAssertion = Awaited<
  ReturnType<Credential.Status.VerifyAndParseStatusAssertion>
>["parsedStatusAssertion"]["payload"];

/**
 * Alias for the WalletInstanceStatus type
 */
export type WalletInstanceStatus = Awaited<
  ReturnType<typeof WalletInstance.getWalletInstanceStatus>
>;

/**
 * Alias for the WalletInstanceRevocationReason type
 */
export type WalletInstanceRevocationReason =
  WalletInstanceStatus["revocation_reason"];

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
  issuerConf: IssuerConfiguration | LegacyIssuerConfiguration; // The Wallet might still contain older credentials
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
