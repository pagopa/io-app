import { generate } from "@pagopa/io-react-native-crypto";
import {
  AuthorizationDetail,
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import { v4 as uuidv4 } from "uuid";
import { type IdentificationContext } from "../../machine/eid/context";
import {
  CredentialAccessToken,
  IssuerConfiguration,
  StoredCredential
} from "./itwTypesUtils";
import {
  DPOP_KEYTAG,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";
import { WALLET_SPEC_VERSION } from "./constants";
import { extractVerification } from "./itwCredentialUtils";
import { Env } from "./environment";

const CREDENTIAL_TYPE = "PersonIdentificationData";

type StartAuthFlowParams = {
  env: Env;
  walletAttestation: string;
  identification: IdentificationContext;
  withMRTDPoP: boolean;
};

/**
 * Function to start the authentication flow. It must be invoked before
 * proceeding with the authentication process to get the `authUrl` and other parameters needed later.
 * After completing the initial authentication flow and obtaining the redirectAuthUrl from the WebView (CIE + PIN & SPID) or Browser (CIEID),
 * the flow must be completed by invoking `completeAuthFlow`.
 * @param env - The environment to use for the wallet provider base URL
 * @param walletAttestation - The wallet attestation.
 * @param identification - The identification context.
 * @param withMRTDPoP - Whether to use MRTD PoP proof or not.
 * @returns Authentication params to use when completing the flow.
 */
const startAuthFlow = async ({
  env,
  walletAttestation,
  identification,
  withMRTDPoP
}: StartAuthFlowParams) => {
  const startFlow: Credential.Issuance.StartFlow = () => ({
    issuerUrl: env.WALLET_PID_PROVIDER_BASE_URL,
    credentialId: "dc_sd_jwt_PersonIdentificationData"
  });

  const idpHint = getIdpHint(identification, env);

  const { issuerUrl, credentialId } = startFlow();

  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    issuerUrl
  );

  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
    await Credential.Issuance.startUserAuthorization(
      issuerConf,
      [credentialId],
      withMRTDPoP
        ? { proofType: "mrtd-pop", idpHinting: idpHint }
        : { proofType: "none" },
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
    credentialDefinition: credentialDefinition[0], // Get the first as only one credential was authorized
    redirectUri: env.ISSUANCE_REDIRECT_URI
  };
};

export type CompleteAuthFlowParams = {
  callbackUrl: string;
  issuerConf: IssuerConfiguration;
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
  issuerConf: IssuerConfiguration;
  accessToken: CredentialAccessToken;
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

  const credentialIdentifierDefinition = getCredentialIdentifierFromAccessToken(
    accessToken,
    credentialDefinition
  );

  const { credential, format } = await Credential.Issuance.obtainCredential(
    issuerConf,
    accessToken,
    clientId,
    credentialIdentifierDefinition,
    {
      credentialCryptoContext,
      dPopCryptoContext: dPoPContext
    }
  );

  const { parsedCredential, issuedAt, expiration } =
    await Credential.Issuance.verifyAndParseCredential(
      issuerConf,
      credential,
      credentialIdentifierDefinition.credential_configuration_id,
      { credentialCryptoContext, ignoreMissingAttributes: true }
    );

  return {
    parsedCredential,
    issuerConf,
    keyTag: credentialKeyTag,
    credentialType: CREDENTIAL_TYPE,
    credentialId: credentialIdentifierDefinition.credential_configuration_id,
    format,
    credential,
    jwt: {
      expiration: expiration.toISOString(),
      issuedAt: issuedAt?.toISOString()
    },
    spec_version: WALLET_SPEC_VERSION,
    verification: extractVerification({ format, credential, parsedCredential })
  };
};

export { startAuthFlow, completeAuthFlow, getPid };

/**
 * This function extracts the first credential identifier from the access token. The token might contain
 * more than one identifier, and for each one of them the Wallet should call `Credential.Issuance.ObtainCredential`.
 * Currently only one identifier is returned, so it is safe to extract the first.
 * @param accessToken The token received from the Issuer's token endpoint
 * @param authorizationDetail The initial authorization request for a certain credential
 * @returns `credential_configuration_id` and `credential_identifier`
 */
function getCredentialIdentifierFromAccessToken(
  accessToken: CredentialAccessToken,
  authorizationDetail: AuthorizationDetail
) {
  if (authorizationDetail.type !== "openid_credential") {
    throw new Error(
      `Unsupported authorization detail type: ${authorizationDetail.type}`
    );
  }

  const accessTokenAuthDetail = accessToken.authorization_details.find(
    authDetails =>
      authDetails.credential_configuration_id ===
      authorizationDetail.credential_configuration_id
  );

  if (!accessTokenAuthDetail) {
    throw new Error(
      `The requested credential configuration ID "${authorizationDetail.credential_configuration_id}" was not found in the access token`
    );
  }

  return {
    credential_configuration_id:
      accessTokenAuthDetail.credential_configuration_id,
    credential_identifier: accessTokenAuthDetail.credential_identifiers[0]
  };
}

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
 * @param env the environment currently in use
 * @param isL3 flag that indicates that we need to issue an L3 PID
 */
export const getIdpHint = (idCtx: IdentificationContext, env: Env) => {
  const isSpidMode = idCtx.mode === "spid";

  if (env.type === "pre") {
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
export const getSpidProductionIdpHint = (spidIdpId: string) => {
  if (!(spidIdpId in SPID_IDP_HINTS)) {
    throw new Error(`Unknown idp ${spidIdpId}`);
  }
  return SPID_IDP_HINTS[spidIdpId];
};
