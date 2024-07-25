import { generate } from "@pagopa/io-react-native-crypto";
import {
  type AuthorizationContext,
  createCryptoContextFor,
  Credential,
  AuthorizationDetail
} from "@pagopa/io-react-native-wallet";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import uuid from "react-native-uuid";
import { URL } from "react-native-url-polyfill";
import {
  itwPidProviderBaseUrl,
  itWalletIssuanceRedirectUri,
  itWalletIssuanceRedirectUriCie,
  itwCieIdpHint
} from "../../../../config";
import { type IdentificationContext } from "../../machine/eid/context";
import { StoredCredential } from "./itwTypesUtils";

type AccessToken = Awaited<
  ReturnType<typeof Credential.Issuance.authorizeAccess>
>["accessToken"];

type IssuerConf = Parameters<Credential.Issuance.ObtainCredential>[0];

// TODO [SIW-1359]: get the correct urls for production
const SPID_HINT = "https://demo.spid.gov.it";

// This can be any URL, as long as it has http or https as its protocol, otherwise it cannot be managed by the webview.
const CIE_L3_REDIRECT_URI = "https://cie.callback";
const CREDENTIAL_TYPE = "PersonIdentificationData";

const idpHintsMap: Record<IdentificationContext["mode"], string> = {
  cieId: itwCieIdpHint,
  ciePin: itwCieIdpHint,
  spid: SPID_HINT
};

// Different scheme to avoid conflicts with the scheme handled by io-react-native-login-utils's activity
const getRedirectUri = (identificationMode: IdentificationContext["mode"]) =>
  identificationMode === "cieId"
    ? itWalletIssuanceRedirectUriCie
    : itWalletIssuanceRedirectUri;

type StartCieAuthFlowParams = {
  walletAttestation: string;
  wiaCryptoContext: CryptoContext;
};

/**
 * Function to start the authentication flow when using CIE + PIN. It must be invoked before
 * reading the card to get the `authUrl` to launch the CIE web view, and other params that are needed later.
 * After successfully reading the card, the flow must be completed invoking `completeCieAuthFlow`.
 * @param walletAttestation - The wallet attestation.
 * @param wiaCryptoContext - The crypto context related to the wallet attestation.
 * @returns Authentication params to use when completing the flow.
 */
const startCieAuthFlow = async ({
  walletAttestation,
  wiaCryptoContext
}: StartCieAuthFlowParams) => {
  const startFlow: Credential.Issuance.StartFlow = () => ({
    issuerUrl: itwPidProviderBaseUrl,
    credentialType: CREDENTIAL_TYPE
  });

  const { issuerUrl, credentialType } = startFlow();

  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    issuerUrl
  );

  const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
    await Credential.Issuance.startUserAuthorization(
      issuerConf,
      credentialType,
      {
        walletInstanceAttestation: walletAttestation,
        redirectUri: CIE_L3_REDIRECT_URI,
        wiaCryptoContext
      }
    );

  const authzRequestEndpoint =
    issuerConf.oauth_authorization_server.authorization_endpoint;

  const params = new URLSearchParams({
    client_id: clientId,
    request_uri: issuerRequestUri,
    idphint: idpHintsMap.ciePin
  });

  return {
    authUrl: `${authzRequestEndpoint}?${params}`,
    issuerConf,
    clientId,
    codeVerifier,
    credentialDefinition
  };
};

type CompleteCieAuthFlowParams = {
  callbackUrl: string;
  issuerConf: IssuerConf;
  clientId: string;
  codeVerifier: string;
  walletAttestation: string;
  wiaCryptoContext: CryptoContext;
};

export type CompleteCieAuthFlowResult = Awaited<
  ReturnType<typeof completeCieAuthFlow>
>;

/**
 * Function to complete the CIE + PIN authentication flow. It must be invoked after `startCieAuthFlow`
 * and after reading the card to get the final `callbackUrl`. The rest of the parameters are those obtained from
 * `startCieAuthFlow` + the wallet attestation.
 * @param walletAttestation - The wallet attestation.
 * @param wiaCryptoContext - The crypto context related to the wallet attestation.
 * @param callbackUrl - The callback url from which the code to get the access token is extracted.
 * @returns Authentication tokens.
 */
const completeCieAuthFlow = async ({
  callbackUrl,
  clientId,
  codeVerifier,
  issuerConf,
  walletAttestation,
  wiaCryptoContext
}: CompleteCieAuthFlowParams) => {
  const query = Object.fromEntries(new URL(callbackUrl).searchParams);
  const { code } = Credential.Issuance.parseAuthroizationResponse(query);

  const { accessToken, dPoPContext } =
    await Credential.Issuance.authorizeAccess(
      issuerConf,
      code,
      clientId,
      CIE_L3_REDIRECT_URI,
      codeVerifier,
      {
        walletInstanceAttestation: walletAttestation,
        wiaCryptoContext
      }
    );

  return { accessToken, dPoPContext };
};

type FullAuthFlowParams = {
  walletAttestation: string;
  wiaCryptoContext: CryptoContext;
  identification: Exclude<IdentificationContext, { mode: "ciePin" }>;
};

/**
 * Full authentication flow completely handled by `io-react-native-wallet`. The consumer of the library
 * does not need to implement any authentication screen or logic. Only compatible with SPID and CieID.
 * @param walletAttestation - The wallet attestation.
 * @param wiaCryptoContext - The crypto context related to the wallet attestation.
 * @param identification - Object that contains details on the selected identification mode.
 * @returns Authentication tokens and other params needed to get the PID.
 */
const startAndCompleteFullAuthFlow = async ({
  walletAttestation,
  wiaCryptoContext,
  identification
}: FullAuthFlowParams) => {
  const authorizationContext: AuthorizationContext | undefined =
    identification.mode === "spid"
      ? { authorize: openAuthenticationSession }
      : undefined;

  const startFlow: Credential.Issuance.StartFlow = () => ({
    issuerUrl: itwPidProviderBaseUrl,
    credentialType: CREDENTIAL_TYPE
  });

  const { issuerUrl, credentialType } = startFlow();

  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    issuerUrl
  );

  const redirectUri = getRedirectUri(identification.mode);

  const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
    await Credential.Issuance.startUserAuthorization(
      issuerConf,
      credentialType,
      {
        walletInstanceAttestation: walletAttestation,
        redirectUri,
        wiaCryptoContext
      }
    );

  const { code } =
    await Credential.Issuance.completeUserAuthorizationWithQueryMode(
      issuerRequestUri,
      clientId,
      issuerConf,
      idpHintsMap[identification.mode], // TODO [SIW-1359]: pass the IDP id to the SPID hint
      redirectUri,
      authorizationContext
    );

  const { accessToken, dPoPContext } =
    await Credential.Issuance.authorizeAccess(
      issuerConf,
      code,
      clientId,
      redirectUri,
      codeVerifier,
      {
        walletInstanceAttestation: walletAttestation,
        wiaCryptoContext
      }
    );

  return {
    accessToken,
    dPoPContext,
    credentialDefinition,
    clientId,
    issuerConf
  };
};

type PidIssuanceParams = {
  issuerConf: IssuerConf;
  accessToken: AccessToken;
  clientId: string;
  dPoPContext: CryptoContext;
  credentialDefinition: AuthorizationDetail;
};

/**
 * Function to get the PID, parse it and return it in {@link StoredCredential} format.
 * It must be called after either one of the following:
 * - `startCieAuthFlow` and `completeCieAuthFlow`
 * - `startAndCompleteFullAuthFlow`
 * @returns The stored credential.
 */
const getPid = async ({
  issuerConf,
  clientId,
  accessToken,
  dPoPContext,
  credentialDefinition
}: PidIssuanceParams): Promise<StoredCredential> => {
  const credentialKeyTag = uuid.v4().toString();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

  const { credential, format } = await Credential.Issuance.obtainCredential(
    issuerConf,
    accessToken,
    clientId,
    credentialDefinition,
    dPoPContext,
    { credentialCryptoContext }
  );

  const { parsedCredential } =
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
    format,
    credential
  };
};

export {
  startCieAuthFlow,
  completeCieAuthFlow,
  startAndCompleteFullAuthFlow,
  getPid
};
