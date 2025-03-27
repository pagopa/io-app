import { generate } from "@pagopa/io-react-native-crypto";
import {
  AuthorizationDetail,
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import { v4 as uuidv4 } from "uuid";
import {
  itWalletIssuanceRedirectUri,
  itwIdpHintTest,
  itwPidProviderBaseUrl
} from "../../../../config";
import { type IdentificationContext } from "../../machine/eid/context";
import { StoredCredential } from "./itwTypesUtils";
import {
  DPOP_KEYTAG,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";

type AccessToken = Awaited<
  ReturnType<typeof Credential.Issuance.authorizeAccess>
>["accessToken"];

type IssuerConf = Parameters<Credential.Issuance.ObtainCredential>[0];

const CREDENTIAL_TYPE = "PersonIdentificationData";

type StartAuthFlowParams = {
  walletAttestation: string;
  identification: IdentificationContext;
};

/**
 * Function to start the authentication flow. It must be invoked before
 * proceeding with the authentication process to get the `authUrl` and other parameters needed later.
 * After completing the initial authentication flow and obtaining the redirectAuthUrl from the WebView (CIE + PIN & SPID) or Browser (CIEID),
 * the flow must be completed by invoking `completeAuthFlow`.
 * @param walletAttestation - The wallet attestation.
 * @returns Authentication params to use when completing the flow.
 */
const startAuthFlow = async ({
  walletAttestation,
  identification
}: StartAuthFlowParams) => {
  const startFlow: Credential.Issuance.StartFlow = () => ({
    issuerUrl: itwPidProviderBaseUrl,
    credentialType: CREDENTIAL_TYPE
  });

  const idpHint = getIdpHint(identification);

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
        redirectUri: itWalletIssuanceRedirectUri,
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
    redirectUri: itWalletIssuanceRedirectUri
  };
};

type CompleteAuthFlowParams = {
  callbackUrl: string;
  issuerConf: IssuerConf;
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

type PidIssuanceParams = {
  issuerConf: IssuerConf;
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
    format,
    credential,
    jwt: {
      expiration: expiration.toISOString(),
      issuedAt: issuedAt?.toISOString()
    }
  };
};

export { startAuthFlow, completeAuthFlow, getPid };

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
