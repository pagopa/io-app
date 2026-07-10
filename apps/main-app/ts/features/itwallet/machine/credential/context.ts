import { CryptoContext } from "@pagopa/io-react-native-jwt";
import {
  CredentialOfferResolved,
  CredentialAccessToken,
  CredentialBundle,
  EvaluatedDcqlQueryResult,
  IssuerConfiguration,
  RequestObject,
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
  isItWalletValid: boolean;
  /**
   * Flag to indicate if the wallet lifecycle is valid and can issue credentials.
   */
  isWalletValid: boolean;
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
   * Result of evaluating the issuer DCQL query against the PID before the trust issuer screen.
   * It is reused to show the requested claims and complete the authorization without recalculating.
   */
  evaluatedDcqlQuery: EvaluatedDcqlQueryResult | undefined;
  responseMode: string | undefined;
  /**
   * Obtained credentials from the issuer.
   */
  credentials: ReadonlyArray<CredentialBundle> | undefined;
  /**
   * The failure that occurred during the credential issuance process, if any.
   */
  failure: CredentialIssuanceFailure | undefined;

  credentialOfferUri: string | undefined;
  resolvedCredentialOffer: CredentialOfferResolved | undefined;

  /**
   * The access token obtained from the Issuer. If the session with the Wallet Provider expires
   * before requesting the credential, this token is used to retry the request.
   */
  accessToken: CredentialAccessToken | undefined;
  /**
   * An optional dictionary of Wallet Unit Attestations generated for the issuance.
   */
  walletUnitAttestations?: Record<string, string>;
};

export const InitialContext: Context = {
  mode: "issuance",
  isItWalletValid: false,
  isWalletValid: false,
  credentialType: undefined,
  wiaCryptoContext: undefined,
  walletInstanceAttestation: undefined,
  issuerConf: undefined,
  clientId: undefined,
  codeVerifier: undefined,
  requestedCredential: undefined,
  evaluatedDcqlQuery: undefined,
  responseMode: undefined,
  credentials: undefined,
  failure: undefined,
  credentialOfferUri: undefined,
  resolvedCredentialOffer: undefined,
  accessToken: undefined
};
