import { CryptoContext } from "@pagopa/io-react-native-jwt";
import { AuthorizationDetail } from "@pagopa/io-react-native-wallet";
import { RequestObject } from "@pagopa/io-react-native-wallet/lib/typescript/credential/presentation/types";
import {
  IssuerConfiguration,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { CredentialIssuanceFailure } from "./failure";

export type Context = {
  credentialType: string | undefined;
  wiaCryptoContext: CryptoContext | undefined;
  walletInstanceAttestation: string | undefined;
  issuerConf: IssuerConfiguration | undefined;
  clientId: string | undefined;
  codeVerifier: string | undefined;
  credentialDefinition: AuthorizationDetail | undefined;
  requestedCredential: RequestObject | undefined;
  credential: StoredCredential | undefined;
  failure: CredentialIssuanceFailure | undefined;
};

export const InitialContext: Context = {
  credentialType: undefined,
  wiaCryptoContext: undefined,
  walletInstanceAttestation: undefined,
  issuerConf: undefined,
  clientId: undefined,
  codeVerifier: undefined,
  credentialDefinition: undefined,
  requestedCredential: undefined,
  credential: undefined,
  failure: undefined
};
