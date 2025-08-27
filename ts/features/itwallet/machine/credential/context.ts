import { CryptoContext } from "@pagopa/io-react-native-jwt";

import {
  IssuerConfiguration,
  StoredCredential,
  RequestObject,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { CredentialIssuanceFailure } from "./failure";

export type Context = {
  wiaCryptoContext: CryptoContext | undefined;
  walletInstanceAttestation: WalletInstanceAttestations | undefined;
  credentialType: string | undefined;
  issuerConf: IssuerConfiguration | undefined;
  clientId: string | undefined;
  codeVerifier: string | undefined;
  requestedCredential: RequestObject | undefined;
  credentials: Array<StoredCredential> | undefined;
  failure: CredentialIssuanceFailure | undefined;
  isAsyncContinuation: boolean;
  isWhiteListed?: boolean;
};

export const InitialContext: Context = {
  wiaCryptoContext: undefined,
  walletInstanceAttestation: undefined,
  credentialType: undefined,
  issuerConf: undefined,
  clientId: undefined,
  codeVerifier: undefined,
  requestedCredential: undefined,
  credentials: undefined,
  failure: undefined,
  isAsyncContinuation: false
};
