import {
  AuthorizationDetail as _legacy_AuthorizationDetail,
  Credential as _legacy_Credential,
  Trust as _legacy_Trust,
  WalletInstance as _legacy_WalletInstance
} from "@pagopa/io-react-native-wallet";
import {
  AuthorizationDetail,
  Credential,
  Trust,
  WalletInstance
} from "@pagopa/io-react-native-wallet-v2";

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
 * TODO: [SIW-2530]: remove the legacy type
 */
export type LegacyIssuerConfiguration = Awaited<
  ReturnType<_legacy_Credential.Issuance.EvaluateIssuerTrust>
>["issuerConf"];

/**
 * Alias for the IssuerConfiguration type
 */
export type IssuerConfiguration =
  | Awaited<ReturnType<Credential.Issuance.EvaluateIssuerTrust>>["issuerConf"]
  | LegacyIssuerConfiguration;

/**
 * Alias for the AuthorizationDetail type
 * TODO: [SIW-2530]: remove the legacy type
 */
export type CredentialAuthDetail =
  | AuthorizationDetail
  | _legacy_AuthorizationDetail;

/**
 * Alias for the AccessToken type
 * TODO: [SIW-2530]: remove the legacy type
 */
export type CredentialAccessToken = Awaited<
  ReturnType<
    | Credential.Issuance.AuthorizeAccess
    | _legacy_Credential.Issuance.AuthorizeAccess
  >
>["accessToken"];

/**
 * Alias for the ParseCredential type
 */
export type ParsedCredential = Awaited<
  ReturnType<typeof Credential.Issuance.verifyAndParseCredential>
>["parsedCredential"];

/**
 * Alias for the ParsedStatusAttestation type
 */
export type ParsedStatusAttestation = Awaited<
  ReturnType<typeof Credential.Status.verifyAndParseStatusAttestation>
>["parsedStatusAttestation"]["payload"];

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

export type StoredStatusAttestation =
  | {
      credentialStatus: "valid";
      statusAttestation: string;
      parsedStatusAttestation: ParsedStatusAttestation;
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
  storedStatusAttestation?: StoredStatusAttestation;
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
