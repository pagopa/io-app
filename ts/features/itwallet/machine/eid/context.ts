import {
  type AuthorizationDetail,
  type Credential
} from "@pagopa/io-react-native-wallet";
import type {
  WalletInstanceAttestations,
  StoredCredential
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
  issuerConf: Parameters<Credential.Issuance.ObtainCredential>[0];
  credentialDefinition: AuthorizationDetail;
  callbackUrl: string;
  redirectUri: string;
};

export type CieContext = {
  isNFCEnabled: boolean;
  isCIEAuthenticationSupported: boolean;
};

export type Context = {
  walletInstanceAttestation: WalletInstanceAttestations | undefined;
  integrityKeyTag: string | undefined;
  cieContext: CieContext | undefined;
  identification: IdentificationContext | undefined;
  authenticationContext: AuthenticationContext | undefined;
  eid: StoredCredential | undefined;
  failure: IssuanceFailure | undefined;
  isReissuing: boolean;
  /** L3 Upgrade */
  isL3: boolean; // Flag to enable IT-Wallet flow for PID issuance and credentials upgrade
  l2Credentials: ReadonlyArray<StoredCredential>; // List of credentials that must be upgraded to L3
};

export const InitialContext: Context = {
  walletInstanceAttestation: undefined,
  integrityKeyTag: undefined,
  cieContext: undefined,
  identification: undefined,
  authenticationContext: undefined,
  eid: undefined,
  failure: undefined,
  isReissuing: false,
  isL3: false,
  l2Credentials: []
};
