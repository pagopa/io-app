import { CryptoContext } from "@pagopa/io-react-native-jwt";
import { AuthorizationDetail } from "@pagopa/io-react-native-wallet";
import { RequestObject } from "@pagopa/io-react-native-wallet/lib/typescript/credential/presentation/types";
import {
  IssuerConfiguration,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { CredentialIssuanceFailure } from "./failure";

export type Context = {
  wiaCryptoContext: CryptoContext | undefined;
  walletInstanceAttestation: string | undefined;
  credentialType: string | undefined;
  issuerConf: IssuerConfiguration | undefined;
  clientId: string | undefined;
  codeVerifier: string | undefined;
  credentialDefinition: AuthorizationDetail | undefined;
  requestedCredential: RequestObject | undefined;
  credential: StoredCredential | undefined;
  failure: CredentialIssuanceFailure | undefined;
  isAsyncContinuation: boolean;
};

export const InitialContext: Context = {
  wiaCryptoContext: undefined,
  walletInstanceAttestation: undefined,
  credentialType: undefined,
  issuerConf: undefined,
  clientId: undefined,
  codeVerifier: undefined,
  credentialDefinition: undefined,
  requestedCredential: undefined,
  credential: undefined,
  failure: undefined,
  isAsyncContinuation: false
};
