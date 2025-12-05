import type {
  AuthorizationDetail,
  Credential
} from "@pagopa/io-react-native-wallet";
import type {
  IssuerConfiguration,
  StoredCredential,
  WalletInstanceAttestations
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

/**
 * The CieContext contains information about the CIE capabilities
 * and NFC status on the device.
 */
export type CieContext = {
  isNFCEnabled: boolean;
  isCIEAuthenticationSupported: boolean;
};

/**
 * The MrtdPoPContext contains the parameters needed to perform
 * the Proof of Possession (PoP) flow for MRTD-based eID issuance.
 */
export type MrtdPoPContext = {
  /**
   * MRTD Challenge info payload
   */
  challenge: string;
  mrtd_auth_session: string;
  mrtd_pop_nonce: string;
  validationUrl: string;
  /**
   * The CIE card CAN code (6 digits)
   */
  can?: string | undefined;
  /**
   * IAS and MRTD payloads from the CIE MRTD PACE reading process.
   */
  ias?: Credential.Issuance.MRTDPoP.IasPayload | undefined;
  mrtd?: Credential.Issuance.MRTDPoP.MrtdPayload | undefined;
  /**
   * The callback URL to be used after the MRTD PoP flow from which
   * we fetch the final authorization URL.
   */
  callbackUrl?: string;
};

/**
 * The EidIssuanceMode represents the different modes of eID issuance.
 * - "issuance": The user is issuing a new PID credential.
 * - "reissuance": The user is reissuing an existing PID credential.
 * - "upgrade": The user is upgrading from Documenti su IO to IT Wallet.
 * - "credentialTriggered": The issuance is triggered by a credential issuance process.
 * This is used to determine the flow and actions available in the eID issuance process.
 */
export type EidIssuanceMode =
  | "issuance"
  | "reissuance"
  | "upgrade"
  | "credentialTriggered";

/**
 * The EidIssuanceLevel represents the different levels of eID issuance and
 * determines which authentication methods are allowed:
 * - "l2": Documenti su IO issuance using CIE+PIN, CIEID, or SPID
 * - "l2-fallback": Documenti su IO issuance using CIEID or SPID (fallback mode)
 * - "l3": IT Wallet issuance using CIE+PIN, CIEID, or SPID plus an additional CIE card authentication
 */
export type EidIssuanceLevel = "l2" | "l2-fallback" | "l3";

export type Context = {
  /**
   * The mode of eID issuance. This determines the flow and actions available in the
   * eID issuance process. Defaults to "issuance" if not specified.
   */
  mode: EidIssuanceMode | undefined;
  /**
   * The level of eID issuance, which determines the authentication methods allowed and
   * the eID level that will be issued: Documenti su IO (L2) or IT Wallet (L2+, L3)
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
   * The MRTD PoP context used during the issuance process.
   */
  mrtdContext: MrtdPoPContext | undefined;
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
  /**
   * The credential type that triggered the eID issuance flow.
   */
  credentialType: string | undefined;
};

export const InitialContext: Context = {
  mode: undefined,
  level: undefined,
  integrityKeyTag: undefined,
  walletInstanceAttestation: undefined,
  cieContext: undefined,
  identification: undefined,
  authenticationContext: undefined,
  mrtdContext: undefined,
  eid: undefined,
  failure: undefined,
  legacyCredentials: [],
  failedCredentials: undefined,
  credentialType: undefined
};
