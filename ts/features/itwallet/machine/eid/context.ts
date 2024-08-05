import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import {
  type Credential,
  type AuthorizationDetail
} from "@pagopa/io-react-native-wallet";
import { type StoredCredential } from "../../common/utils/itwTypesUtils";
import { IssuanceFailure } from "./failure";

export type IdentificationContext =
  | { mode: "cieId"; abortController: AbortController }
  | { mode: "ciePin"; pin: string }
  | { mode: "spid"; idpId: string };

/**
 * When authenticating with CIE + PIN the flow is interrupted
 * by the card reading phase, which is handled outside `io-react-native-wallet`.
 * We need to resume the authentication flow after reading the card,
 * so here we save the auth params obtained in the first step.
 */
export type CieAuthContext = {
  authUrl: string;
  clientId: string;
  codeVerifier: string;
  issuerConf: Parameters<Credential.Issuance.ObtainCredential>[0];
  credentialDefinition: AuthorizationDetail;
  callbackUrl: string;
};

export type WalletAttestationContext = {
  walletAttestation: string;
  wiaCryptoContext: CryptoContext;
};

export type Context = {
  integrityKeyTag: string | undefined;
  walletAttestationContext: WalletAttestationContext | undefined;
  identification: IdentificationContext | undefined;
  cieAuthContext: CieAuthContext | undefined;
  eid: StoredCredential | undefined;
  failure: IssuanceFailure | undefined;
};

export const InitialContext: Context = {
  integrityKeyTag: undefined,
  walletAttestationContext: undefined,
  identification: undefined,
  cieAuthContext: undefined,
  eid: undefined,
  failure: undefined
};
