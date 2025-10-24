import type { AuthorizationDetail } from "@pagopa/io-react-native-wallet";
import type {
  WalletInstanceAttestations,
  StoredCredential,
  IssuerConfiguration
} from "../../common/utils/itwTypesUtils";
import { IssuanceFailure } from "./failure";

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
  credentialDefinition: AuthorizationDetail;
  callbackUrl: string;
  redirectUri: string;
};

export type CieContext = {
  isNFCEnabled: boolean;
  isCIEAuthenticationSupported: boolean;
};

/**
 * The EidIssuanceMode represents the different modes of eID issuance.
 * - "issuance": The user is issuing a new PID credential.
 * - "reissuance": The user is reissuing an existing PID credential.
 * - "upgrade": The user is upgrading from Documenti su IO to IT Wallet.
 * This is used to determine the flow and actions available in the eID issuance process.
 */
export type EidIssuanceMode = "issuance" | "reissuance" | "upgrade";

/**
 * The EidIssuanceLevel represents the different levels of eID issuance and
 * determines which authentication method are allowed:
 * - "l2" for Documenti su IO issuance with CIE+PIN, CIEID and SPID
 * - "l2-fallback" for Documenti su IO issuance with CIEID and SPID
 * - "l2-plus" for IT-Wallet issuance with CIE+PIN, CIEID and SPID plus a CIE authentication
 * - "l3" for IT-Wallet issuance with CIE+PIN and CIEID
 */
export type EidIssuanceLevel = "l2" | "l2-fallback" | "l2-plus" | "l3";

export type Context = {
  /**
   * The mode of eID issuance. This determines the flow and actions available in the
   * eID issuance process. Defaults to "issuance" if not specified.
   */
  mode: EidIssuanceMode | undefined;
  /**
   * The level of eID issuance, which determines the authentication methods allowed and
   * the eID level that will be issuedL Documenti su IO (L2) or IT Wallet (L2+, L3)
   */
  level: EidIssuanceLevel | undefined;
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
   * The credentials that need to be upgraded to the new format.
   */
  legacyCredentials: ReadonlyArray<StoredCredential>;
  /**
   * Credentials that failed the upgrade process.
   */
  failedCredentials: ReadonlyArray<StoredCredential> | undefined;
};

export const InitialContext: Context = {
  mode: undefined,
  level: undefined,
  integrityKeyTag: undefined,
  walletInstanceAttestation: undefined,
  cieContext: undefined,
  identification: undefined,
  authenticationContext: undefined,
  eid: undefined,
  failure: undefined,
  legacyCredentials: [],
  failedCredentials: undefined
};
