import { AuthorizationDetail } from "@pagopa/io-react-native-wallet";
import {
  IssuerConfiguration,
  RequestObject,
  StoredCredential
} from "./itwTypesUtils";
import { Env } from "./environment";
import * as CredentialIssuanceUtilsV1 from "./itwCredentialIssuanceUtilsV1";
import * as CredentialIssuanceUtilsV2 from "./itwCredentialIssuanceUtilsV2";

// TODO: [SIW-2530] After fully migrating to the new API, move the content of itwCredentialIssuanceUtilsV2
// to itwCredentialIssuanceUtils

export type RequestCredentialParams = {
  env: Env;
  credentialType: string;
  walletInstanceAttestation: string;
  isNewIssuanceFlowEnabled: boolean;
};

/**
 * Requests a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param credentialType - The type of credential to request
 * @param walletInstanceAttestation - The wallet instance attestation
 * @returns The credential request object
 */
export const requestCredential = async (params: RequestCredentialParams) =>
  params.isNewIssuanceFlowEnabled
    ? CredentialIssuanceUtilsV2.requestCredential(params)
    : CredentialIssuanceUtilsV1.requestCredential(params);

export type ObtainCredentialParams = {
  env: Env;
  credentialType: string;
  walletInstanceAttestation: string;
  requestedCredential: RequestObject;
  pid: StoredCredential;
  clientId: string;
  codeVerifier: string;
  credentialDefinition?: AuthorizationDetail;
  issuerConf: IssuerConfiguration;
  isNewIssuanceFlowEnabled: boolean;
};

/**
 * Obtains a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param credentialType - The type of credential to request
 * @param requestedCredential - The requested credential
 * @param pid - The PID credential
 * @param walletInstanceAttestation - The wallet instance attestation
 * @param clientId - The client ID
 * @param codeVerifier - The code verifier
 * @param credentialDefinition - The credential definition
 * @param issuerConf - The issuer configuration
 * @returns The obtained credential
 */
export const obtainCredential = async (params: ObtainCredentialParams) =>
  params.isNewIssuanceFlowEnabled
    ? CredentialIssuanceUtilsV2.obtainCredential(
        params as CredentialIssuanceUtilsV2.ObtainCredentialParams
      )
    : CredentialIssuanceUtilsV1.obtainCredential(
        params as CredentialIssuanceUtilsV1.ObtainCredentialParams
      );
