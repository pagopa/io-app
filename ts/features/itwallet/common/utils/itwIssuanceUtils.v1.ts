import { generate } from "@pagopa/io-react-native-crypto";
import {
  AuthorizationDetail,
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import { v4 as uuidv4 } from "uuid";
import { type IdentificationContext } from "../../machine/eid/context";
import { LegacyIssuerConfiguration, StoredCredential } from "./itwTypesUtils";
import {
  DPOP_KEYTAG,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";
import { Env } from "./environment";
import { getIdpHint } from "./itwIssuanceUtils";

type AccessToken = Awaited<
  ReturnType<Credential.Issuance.AuthorizeAccess>
>["accessToken"];

const CREDENTIAL_TYPE = "PersonIdentificationData";

type StartAuthFlowParams = {
  env: Env;
  walletAttestation: string;
  identification: IdentificationContext;
};

/**
 * Function to start the authentication flow. It must be invoked before
 * proceeding with the authentication process to get the `authUrl` and other parameters needed later.
 * After completing the initial authentication flow and obtaining the redirectAuthUrl from the WebView (CIE + PIN & SPID) or Browser (CIEID),
 * the flow must be completed by invoking `completeAuthFlow`.
 * @param env - The environment to use for the wallet provider base URL
 * @param walletAttestation - The wallet attestation.
 * @param identification - The identification context.
 * @returns Authentication params to use when completing the flow.
 */
const startAuthFlow = async ({
  env,
  walletAttestation,
  identification
}: StartAuthFlowParams) => {
  const startFlow: Credential.Issuance.StartFlow = () => ({
    issuerUrl: env.WALLET_PID_PROVIDER_BASE_URL,
    credentialType: CREDENTIAL_TYPE
  });

  const idpHint = getIdpHint(identification, env, false);

  const { issuerUrl, credentialType } = startFlow();

  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    issuerUrl
  );

  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
    await Credential.Issuance.startUserAuthorization(
      issuerConf,
      credentialType,
      {
        walletInstanceAttestation: walletAttestation,
        redirectUri: env.ISSUANCE_REDIRECT_URI,
        wiaCryptoContext
      }
    );

  // Obtain the Authorization URL
  const { authUrl } = await Credential.Issuance.buildAuthorizationUrl(
    issuerRequestUri,
    clientId,
    issuerConf,
    idpHint
  );

  return {
    authUrl,
    issuerConf,
    clientId,
    codeVerifier,
    credentialDefinition,
    redirectUri: env.ISSUANCE_REDIRECT_URI
  };
};

export type CompleteAuthFlowParams = {
  callbackUrl: string;
  issuerConf: LegacyIssuerConfiguration;
  clientId: string;
  codeVerifier: string;
  walletAttestation: string;
  redirectUri: string;
};

export type CompleteAuthFlowResult = Awaited<
  ReturnType<typeof completeAuthFlow>
>;

/**
 * Function to complete the authentication flow. It must be invoked after `startAuthFlow`
 * and after obtaining the final `callbackUrl` from the WebView (CIE + PIN & SPID) or Browser (CIEID).
 * The rest of the parameters are those obtained from `startAuthFlow` + the wallet attestation.
 * @param walletAttestation - The wallet attestation.
 * @param callbackUrl - The callback url from which the code to get the access token is extracted.
 * @returns Authentication tokens.
 */
const completeAuthFlow = async ({
  callbackUrl,
  clientId,
  codeVerifier,
  issuerConf,
  walletAttestation,
  redirectUri
}: CompleteAuthFlowParams) => {
  const { code } =
    await Credential.Issuance.completeUserAuthorizationWithQueryMode(
      callbackUrl
    );

  await regenerateCryptoKey(DPOP_KEYTAG);
  const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const { accessToken } = await Credential.Issuance.authorizeAccess(
    issuerConf,
    code,
    clientId,
    redirectUri,
    codeVerifier,
    {
      walletInstanceAttestation: walletAttestation,
      wiaCryptoContext,
      dPopCryptoContext
    }
  );

  return { accessToken, dPoPContext: dPopCryptoContext };
};

export type PidIssuanceParams = {
  issuerConf: LegacyIssuerConfiguration;
  accessToken: AccessToken;
  clientId: string;
  dPoPContext: CryptoContext;
  credentialDefinition: AuthorizationDetail;
};

/**
 * Function to get the PID, parse it and return it in {@link StoredCredential} format.
 * It must be called after `startAuthFlow` and `completeAuthFlow`.
 * @returns The stored credential.
 */
const getPid = async ({
  issuerConf,
  clientId,
  accessToken,
  dPoPContext,
  credentialDefinition
}: PidIssuanceParams): Promise<StoredCredential> => {
  const credentialKeyTag = uuidv4().toString();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

  const { credential, format } = await Credential.Issuance.obtainCredential(
    issuerConf,
    accessToken,
    clientId,
    credentialDefinition,
    {
      credentialCryptoContext,
      dPopCryptoContext: dPoPContext
    }
  );

  const { parsedCredential, issuedAt, expiration } =
    await Credential.Issuance.verifyAndParseCredential(
      issuerConf,
      credential,
      format,
      { credentialCryptoContext }
    );

  return {
    parsedCredential,
    issuerConf,
    keyTag: credentialKeyTag,
    credentialType: CREDENTIAL_TYPE,
    credentialId: CREDENTIAL_TYPE,
    format,
    credential,
    jwt: {
      expiration: expiration.toISOString(),
      issuedAt: issuedAt?.toISOString()
    }
  };
};

export { startAuthFlow, completeAuthFlow, getPid };
