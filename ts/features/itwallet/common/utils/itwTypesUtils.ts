import {
  Credential,
  Trust,
  WalletInstance
} from "@pagopa/io-react-native-wallet";

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
  ReturnType<Credential.Presentation.GetRequestObject>
>["requestObject"];

/**
 * Alias type for the relying party entity configuration.
 */
export type RpEntityConfiguration =
  Trust.RelyingPartyEntityConfiguration["payload"]["metadata"];

/**
 * Alias for the IssuerConfiguration type
 */
export type IssuerConfiguration = Awaited<
  ReturnType<typeof Credential.Issuance.evaluateIssuerTrust>
>["issuerConf"];

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
  issuerConf: IssuerConfiguration;
  storedStatusAttestation?: StoredStatusAttestation;
  /**
   * The SD-JWT issuance and expiration dates in ISO format.
   * These might be different from the underlying document's dates.
   */
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
