import { generate } from "@pagopa/io-react-native-crypto";
import {
  AuthorizationDetail,
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { v4 as uuidv4 } from "uuid";
import {
  DPOP_KEYTAG,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";
import { RequestObject, StoredCredential } from "./itwTypesUtils";
import { Env } from "./environment";

type IssuerConfiguration = Awaited<
  ReturnType<Credential.Issuance.EvaluateIssuerTrust>
>["issuerConf"];

export type RequestCredentialParams = {
  env: Env;
  credentialType: string;
  walletInstanceAttestation: string;
};

/**
 * Requests a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param credentialType - The type of credential to request
 * @param walletInstanceAttestation - The wallet instance attestation
 * @returns The credential request object
 */
export const requestCredential = async ({
  env,
  credentialType,
  walletInstanceAttestation
}: RequestCredentialParams) => {
  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Evaluate issuer trust
  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    env.WALLET_EAA_PROVIDER_BASE_URL
  );

  // Start user authorization

  const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
    await Credential.Issuance.startUserAuthorization(
      issuerConf,
      credentialType,
      {
        walletInstanceAttestation,
        redirectUri: `${env.ISSUANCE_REDIRECT_URI}`,
        wiaCryptoContext
      }
    );

  const requestObject =
    await Credential.Issuance.getRequestedCredentialToBePresented(
      issuerRequestUri,
      clientId,
      issuerConf
    );

  return {
    clientId,
    codeVerifier,
    credentialDefinition,
    requestedCredential: requestObject,
    issuerConf
  };
};

export type ObtainCredentialParams = {
  env: Env;
  credentialType: string;
  walletInstanceAttestation: string;
  requestedCredential: RequestObject;
  pid: StoredCredential;
  clientId: string;
  codeVerifier: string;
  credentialDefinition: AuthorizationDetail;
  issuerConf: IssuerConfiguration;
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
export const obtainCredential = async ({
  env,
  credentialType,
  requestedCredential,
  pid,
  walletInstanceAttestation,
  clientId,
  codeVerifier,
  credentialDefinition,
  issuerConf
}: ObtainCredentialParams) => {
  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Create PID and DPoP crypto context;
  await regenerateCryptoKey(DPOP_KEYTAG);
  const pidCryptoContext = createCryptoContextFor(pid.keyTag);
  const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

  // Complete the user authorization via form_post.jwt mode
  const { code } =
    await Credential.Issuance.completeUserAuthorizationWithFormPostJwtMode(
      requestedCredential,
      {
        wiaCryptoContext,
        pidCryptoContext,
        pid: pid.credential,
        walletInstanceAttestation
      }
    );

  const { accessToken } = await Credential.Issuance.authorizeAccess(
    issuerConf,
    code,
    clientId,
    `${env.ISSUANCE_REDIRECT_URI}`,
    codeVerifier,
    {
      walletInstanceAttestation,
      dPopCryptoContext,
      wiaCryptoContext
    }
  );

  // Create credential crypto context

  const credentialKeyTag = uuidv4().toString();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

  // Obtain the credential

  const { credential, format } = await Credential.Issuance.obtainCredential(
    issuerConf,
    accessToken,
    clientId,
    credentialDefinition,
    {
      dPopCryptoContext,
      credentialCryptoContext
    }
  );

  // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.

  const { parsedCredential, issuedAt, expiration } =
    await Credential.Issuance.verifyAndParseCredential(
      issuerConf,
      credential,
      format,
      { credentialCryptoContext, ignoreMissingAttributes: false }
    );

  const storedCredential: StoredCredential = {
    credential,
    parsedCredential,
    credentialType,
    credentialId: credentialType,
    format,
    issuerConf,
    keyTag: credentialKeyTag,
    jwt: {
      expiration: expiration.toISOString(),
      issuedAt: issuedAt?.toISOString()
    }
  };

  return {
    credential: storedCredential
  };
};
