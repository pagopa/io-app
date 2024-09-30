import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import {
  type AuthorizationDetail,
  type Credential
} from "@pagopa/io-react-native-wallet";
import { type StoredCredential } from "../../common/utils/itwTypesUtils";
import { IssuanceFailure } from "./failure";

type WithAbortController<T> = T & { abortController?: AbortController };

export type IdentificationContext =
  | WithAbortController<{ mode: "cieId" }>
  | WithAbortController<{ mode: "ciePin"; pin: string }>
  | WithAbortController<{ mode: "spid"; idpId: string }>;

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

export type Context = {
  wiaCryptoContext: CryptoContext | undefined;
  walletInstanceAttestation: string | undefined;
  integrityKeyTag: string | undefined;
  identification: IdentificationContext | undefined;
  cieAuthContext: CieAuthContext | undefined;
  eid: StoredCredential | undefined;
  failure: IssuanceFailure | undefined;
};

export const InitialContext: Context = {
  wiaCryptoContext: undefined,
  walletInstanceAttestation: undefined,
  integrityKeyTag: undefined,
  identification: undefined,
  cieAuthContext: undefined,
  eid: undefined,
  failure: undefined
};
