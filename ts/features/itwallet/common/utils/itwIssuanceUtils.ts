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
  itwIdpHintTest
} from "../../../../config";
import { type IdentificationContext } from "../../machine/eid/context";
import { StoredCredential } from "./itwTypesUtils";

type AccessToken = Awaited<
  ReturnType<typeof Credential.Issuance.authorizeAccess>
>["accessToken"];

type IssuerConf = Parameters<Credential.Issuance.ObtainCredential>[0];

// This can be any URL, as long as it has http or https as its protocol, otherwise it cannot be managed by the webview.
const CIE_L3_REDIRECT_URI = "https://wallet.io.pagopa.it/index.html";
const CREDENTIAL_TYPE = "PersonIdentificationData";

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
    idphint: getIdpHint({ mode: "ciePin", pin: "" }) // PIN is not needed for the hint
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

  const idpHint = getIdpHint(identification);

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
      idpHint,
      redirectUri,
      authorizationContext,
      // @ts-expect-error update io-react-native-wallet
      identification.abortController?.signal
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

/**
 * Consts for the IDP hints in test for SPID and CIE and in production for CIE.
 * In production for SPID the hint is retrieved from the IDP ID via the {@link getSpidProductionIdpHint} function.
 */
const SPID_HINT_TEST = "https://demo.spid.gov.it";
const CIE_HINT_TEST =
  "https://collaudo.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO";
const CIE_HINT_PROD =
  "https://idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO";

/**
 * Object of the SPID IDP IDs and the corresponding production hint URLs.
 */
const SPID_IDP_HINTS: { [key: string]: string } = {
  arubaid: "https://loginspid.aruba.it",
  ehtid: "https://id.eht.eu",
  infocamereid: "https://loginspid.infocamere.it",
  infocertid: "https://identity.infocert.it",
  intesiid: "https://idp.intesigroup.com",
  lepidaid: "https://id.lepida.it/idp/shibboleth",
  namirialid: "https://idp.namirialtsp.com/idp",
  posteid: "https://posteid.poste.it",
  sielteid: "https://identity.sieltecloud.it",
  spiditalia: "https://spid.register.it",
  timid: "https://login.id.tim.it/affwebservices/public/saml2sso",
  teamsystemid: "https://spid.teamsystem.com/idp"
};

/**
 * Get the IDP hint based on the identification context.
 * If the {@link itwIdpHintTest} is true the hint will be the test one, otherwise the production one.
 * In production for SPID the hint is retrieved from the IDP ID via the {@link getSpidProductionIdpHint} function,
 * for CIE the hint is always the same and it's defined in the {@link CIE_HINT_PROD} constant.
 * @param idCtx the identification context which contains the mode and the IDP ID if the mode is SPID
 * @returns the IDP hint to be provided to the {@link openAuthenticationSession} function
 */
const getIdpHint = (idCtx: IdentificationContext) => {
  const isSpidMode = idCtx.mode === "spid";
  if (itwIdpHintTest) {
    return isSpidMode ? SPID_HINT_TEST : CIE_HINT_TEST;
  } else {
    return isSpidMode ? getSpidProductionIdpHint(idCtx.idpId) : CIE_HINT_PROD;
  }
};

/**
 * Map of the SPID IDP IDs and the corresponding production hint URLs.
 * If the IDP ID is not present in the map an error is thrown.
 * @param spidIdpId
 * @throws {@link Error} if the IDP ID is not present in the map
 * @returns
 */
const getSpidProductionIdpHint = (spidIdpId: string) => {
  if (!(spidIdpId in SPID_IDP_HINTS)) {
    throw new Error(`Unknown idp ${spidIdpId}`);
  }
  return SPID_IDP_HINTS[spidIdpId];
};
