import { CryptoContext } from "@pagopa/io-react-native-jwt";
import {
  IssuerConfiguration,
  RequestObject,
  StoredCredential,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { CredentialIssuanceFailure } from "./failure";

/**
 * The mode for the credential issuance process.
 * It can be:
 * - "issuance": for a new credential issuance
 * - "reissuance": for reissuing an existing credential (for example, when the credential is expired
 *  or about to expire)
 * - "upgrade": for upgrading an existing credential to a the new format
 */
export type CredentialIssuanceMode = "issuance" | "reissuance" | "upgrade";

export type Context = {
  /**
   * The mode for the credential issuance process. It does not change how the credentials are requested,
   * but it is needed to determine how the machine should behave.
   */
  mode: CredentialIssuanceMode;
  /**
   * Flag to indicate if the user has access to the L3 features.
   */
  isWhiteListed: boolean;
  /**
   * Used to indicate that the flow is coming from the asynchrnous issuance flow for the MDL.
   * TODO to be removed in [SIW-2839]
   */
  isAsyncContinuation: boolean;
  /**
   * The type of the credential being issued.
   */
  credentialType: string | undefined;
  /**
   * The WIA crypto context, which contains the necessary cryptographic information for the issuance.
   */
  wiaCryptoContext: CryptoContext | undefined;
  /**
   * The wallet instance attestation of the wallet. If expired, it will be requested a new one.
   */
  walletInstanceAttestation: WalletInstanceAttestations | undefined;
  /**
   * Credential request data
   */
  issuerConf: IssuerConfiguration | undefined;
  clientId: string | undefined;
  codeVerifier: string | undefined;
  requestedCredential: RequestObject | undefined;
  /**
   * Obtained credentials from the issuer.
   */
  credentials: Array<StoredCredential> | undefined;
  /**
   * The failure that occurred during the credential issuance process, if any.
   */
  failure: CredentialIssuanceFailure | undefined;
};

export const InitialContext: Context = {
  mode: "issuance",
  isWhiteListed: false,
  isAsyncContinuation: false,
  credentialType: undefined,
  wiaCryptoContext: undefined,
  walletInstanceAttestation: undefined,
  issuerConf: undefined,
  clientId: undefined,
  codeVerifier: undefined,
  requestedCredential: undefined,
  credentials: undefined,
  failure: undefined
};
