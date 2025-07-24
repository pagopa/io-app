import type {
  WalletInstanceAttestations,
  StoredCredential,
  IssuerConfiguration,
  CredentialAuthDetail
} from "../../common/utils/itwTypesUtils";
import { IssuanceFailure } from "./failure";
import { EidIssuanceInput } from "./input";

export type IdentificationContext =
  | { mode: "cieId"; level: "L2" | "L3" }
  | { mode: "ciePin"; level: "L3"; pin: string }
  | { mode: "spid"; level: "L2"; idpId: string };

/**
 * When authenticating with CIE + PIN the flow is interrupted
 * by the card reading phase, which is handled outside `io-react-native-wallet`.
 * We need to resume the authentication flow after reading the card,
 * so here we save the auth params obtained in the first step.
 */
export type AuthenticationContext = {
  authUrl: string;
  clientId: string;
  codeVerifier: string;
  issuerConf: IssuerConfiguration;
  credentialDefinition: CredentialAuthDetail;
  callbackUrl: string;
  redirectUri: string;
};

export type CieContext = {
  isNFCEnabled: boolean;
  isCIEAuthenticationSupported: boolean;
};

export type Context = {
  /**
   * The integrity key tag used to verify the integrity of the wallet instance attestation.
   * If this is provided the machine will skip the wallet instance attestation creation
   */
  integrityKeyTag: string | undefined;
  /**
   * The wallet instance attestation JWT used to verify the wallet instance.
   */
  walletInstanceAttestation: WalletInstanceAttestations | undefined;
  /**
   * The credentials that need to be upgraded to L3.
   */
  credentials: ReadonlyArray<StoredCredential> | undefined;
  /**
   * CIE capabilities and NFC status.
   */
  cieContext: CieContext | undefined;
  /**
   * The identification context, which can be either CIE ID, CIE PIN, or SPID.
   * It is used to determine the mode and level of identification.
   */
  identification: IdentificationContext | undefined;
  /**
   * The authentication context, which contains the parameters needed to resume the authentication flow
   * after reading the CIE card.
   */
  authenticationContext: AuthenticationContext | undefined;
  /**
   * The obtained PID credential
   */
  eid: StoredCredential | undefined;
  /**
   * The failure that occurred during the issuance process, if any.
   */
  failure: IssuanceFailure | undefined;
  /**
   * Flag to check if the user is reissuing an existing PID credential.
   * If true, the flow will be slightly different, allowing to upgrade the existing credential
   * instead of issuing a new one.
   */
  isReissuing: boolean;
  /**
   *  Flag to check if IT Wallet L3 features are enabled and thus we should allow to request
   * a PID credential and upgrade the existing credentials to L3
   */
  isL3FeaturesEnabled: boolean | undefined;
  /**
   * Flag to check if the user chose to fallback to L2 issuance
   */
  isL2Fallback: boolean;
};

export const getInitialContext = (input: EidIssuanceInput): Context => ({
  integrityKeyTag: input.integrityKeyTag,
  walletInstanceAttestation: input.walletInstanceAttestation,
  credentials: input.credentials,
  cieContext: undefined,
  identification: undefined,
  authenticationContext: undefined,
  eid: undefined,
  failure: undefined,
  isReissuing: false,
  isL3FeaturesEnabled: undefined,
  isL2Fallback: false
});
