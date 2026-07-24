import type {
  AuthorizationDetail,
  CredentialIssuance,
  ItwVersion
} from "@pagopa/io-react-native-wallet";

import type {
  CredentialAccessToken,
  CredentialBundle,
  CredentialMetadata,
  IssuerConfiguration,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";

import { IssuanceFailure } from "./failure";

/**
 * When authenticating with CIE + PIN the flow is interrupted
 * by the card reading phase, which is handled outside `io-react-native-wallet`.
 * We need to resume the authentication flow after reading the card,
 * so here we save the auth params obtained in the first step.
 */
export type AuthenticationContext = {
  authUrl: string;
  callbackUrl: string;
  clientId: string;
  codeVerifier: string;
  credentialDefinition: AuthorizationDetail;
  issuerConf: IssuerConfiguration;
  redirectUri: string;
};

/**
 * The CieContext contains information about the CIE capabilities
 * and NFC status on the device.
 */
export type CieContext = {
  isCIEAuthenticationSupported: boolean;
  isNFCEnabled: boolean;
};

export type Context = {
  /**
   * The access token obtained from the Issuer. If the session with the Wallet Provider expires
   * before requesting the credential, this token is used to retry the request.
   */
  accessToken: CredentialAccessToken | undefined;
  /**
   * The authentication context, which contains the parameters needed to resume the authentication flow
   * after reading the CIE card.
   */
  authenticationContext: AuthenticationContext | undefined;
  /**
   * CIE capabilities and NFC status.
   */
  cieContext: CieContext | undefined;
  /**
   * The credentials that need to be upgraded to the new format.
   */
  credentialsToUpgrade: ReadonlyArray<CredentialMetadata>;
  /**
   * The credential type that triggered the eID issuance flow.
   */
  credentialType: string | undefined;
  /**
   * The obtained PID credential
   */
  eid: CredentialBundle | undefined;
  /**
   * Credentials that failed the upgrade process.
   */
  failedCredentials: ReadonlyArray<CredentialMetadata> | undefined;
  /**
   * The failure that occurred during the issuance process, if any.
   */
  failure: IssuanceFailure | undefined;
  /**
   * The identification context, which can be either CIE ID, CIE PIN, or SPID.
   * It is used to determine the mode and level of identification.
   */
  identification: IdentificationContext | undefined;
  /**
   * The integrity key tag used to verify the integrity of the wallet instance attestation.
   * If this is provided the machine will skip the wallet instance attestation creation
   */
  integrityKeyTag: string | undefined;
  /**
   * IT-Wallet technical specifications version. Dependending on the particular user configuration,
   * the issuance machine must be able to use different versions.
   * This is a local value used only during the issuance flow.
   */
  itwVersion: ItwVersion;
  /**
   * The level of eID issuance, which determines the authentication methods allowed and
   * the eID level that will be issued: Documenti su IO (L2) or IT Wallet (L2+, L3)
   */
  level: EidIssuanceLevel | undefined;
  /**
   * The mode of eID issuance. This determines the flow and actions available in the
   * eID issuance process. Defaults to "issuance" if not specified.
   */
  mode: EidIssuanceMode | undefined;
  /**
   * The MRTD PoP context used during the issuance process.
   */
  mrtdContext: MrtdPoPContext | undefined;
  /**
   * The wallet instance attestation JWT used to verify the wallet instance.
   */
  walletInstanceAttestation: undefined | WalletInstanceAttestations;
  /**
   * An optional dictionary of Wallet Unit Attestations generated for the issuance.
   */
  walletUnitAttestations?: Record<string, string>;
};

/**
 * The EidIssuanceLevel represents the different levels of eID issuance and
 * determines which authentication methods are allowed:
 * - "l2": Documenti su IO issuance using CIE+PIN, CIEID, or SPID
 * - "l2-fallback": Documenti su IO issuance using CIEID or SPID (fallback mode)
 * - "l3": IT Wallet issuance using CIE+PIN, CIEID, or SPID plus an additional CIE card authentication
 */
export type EidIssuanceLevel = "l2" | "l2-fallback" | "l3";

/**
 * The EidIssuanceMode represents the different modes of eID issuance.
 * - "issuance": The user is issuing a new PID credential.
 * - "reissuance": The user is reissuing an existing PID credential.
 * - "upgrade": The user is upgrading from Documenti su IO to IT Wallet.
 * This is used to determine the flow and actions available in the eID issuance process.
 */
export type EidIssuanceMode = "issuance" | "reissuance" | "upgrade";

export type IdentificationContext =
  | { idpId: string; level: "L2"; mode: "spid" }
  | { level: "L2" | "L3"; mode: "cieId" }
  | { level: "L3"; mode: "ciePin"; pin: string };

/**
 * The MrtdPoPContext contains the parameters needed to perform
 * the Proof of Possession (PoP) flow for MRTD-based eID issuance.
 */
export type MrtdPoPContext = {
  /**
   * The callback URL to be used after the MRTD PoP flow from which
   * we fetch the final authorization URL.
   */
  callbackUrl?: string;
  /**
   * The CIE card CAN code (6 digits)
   */
  can?: string | undefined;
  /**
   * MRTD Challenge info payload
   */
  challenge: string;
  /**
   * IAS and MRTD payloads from the CIE MRTD PACE reading process.
   */
  ias?: CredentialIssuance.MRTDPoP.IasPayload | undefined;
  mrtd?: CredentialIssuance.MRTDPoP.MrtdPayload | undefined;
  mrtd_auth_session: string;
  mrtd_pop_nonce: string;
  validationUrl: string;
};

export const InitialContext: Context = {
  itwVersion: "1.0.0", // Initial value to satisfy type constraints. It is assigned in the `onInit` action.
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
  credentialsToUpgrade: [],
  failedCredentials: undefined,
  credentialType: undefined,
  accessToken: undefined
};
