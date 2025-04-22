import {
  type AuthorizationDetail,
  type Credential
} from "@pagopa/io-react-native-wallet";
import { type StoredCredential } from "../../common/utils/itwTypesUtils";
import { IssuanceFailure } from "./failure";

export type IdentificationContext =
  | { mode: "cieId"; level: "L2" }
  | { mode: "cieIdL3"; level: "L3" }
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
  walletInstanceAttestation: string | undefined;
  integrityKeyTag: string | undefined;
  cieContext: CieContext | undefined;
  identification: IdentificationContext | undefined;
  authenticationContext: AuthenticationContext | undefined;
  eid: StoredCredential | undefined;
  failure: IssuanceFailure | undefined;
  isReissuing: boolean;
  // Flag to check if IT Wallet L3 features are enabled and thus we should allow to request
  // a PID credential and upgrade the existing credentials to L3
  isL3FeaturesEnabled: boolean | undefined;
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
  isL3FeaturesEnabled: undefined
};
