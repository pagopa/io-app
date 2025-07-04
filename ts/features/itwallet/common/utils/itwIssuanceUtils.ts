import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import { type IdentificationContext } from "../../machine/eid/context";
import {
  CredentialAccessToken,
  CredentialAuthDetail,
  IssuerConfiguration,
  StoredCredential
} from "./itwTypesUtils";
import { Env } from "./environment";
import * as IssuanceUtilsV1 from "./itwIssuanceUtils.v1";
import * as IssuanceUtilsV2 from "./itwIssuanceUtils.v2";

// TODO: [SIW-2530] After fully migrating to the new API, move the content of itwIssuanceUtils.v2
// to itwIssuanceUtils, then delete itwIssuanceUtils.v1 and itwIssuanceUtils.v2

type StartAuthFlowParams = {
  env: Env;
  walletAttestation: string;
  identification: IdentificationContext;
  isL3IssuanceEnabled: boolean;
  isNewApiEnabled: boolean;
};

/**
 * Function to start the authentication flow. It must be invoked before
 * proceeding with the authentication process to get the `authUrl` and other parameters needed later.
 * After completing the initial authentication flow and obtaining the redirectAuthUrl from the WebView (CIE + PIN & SPID) or Browser (CIEID),
 * the flow must be completed by invoking `completeAuthFlow`.
 * @param env - The environment to use for the wallet provider base URL
 * @param walletAttestation - The wallet attestation.
 * @param identification - The identification context.
 * @param isL3IssuanceEnabled flag that indicates that we need to issue an L3 PID
 * @returns Authentication params to use when completing the flow.
 */
const startAuthFlow = async (params: StartAuthFlowParams) =>
  params.isNewApiEnabled
    ? IssuanceUtilsV2.startAuthFlow(params)
    : IssuanceUtilsV1.startAuthFlow(params);

type CompleteAuthFlowParams = {
  callbackUrl: string;
  issuerConf: IssuerConfiguration;
  clientId: string;
  codeVerifier: string;
  walletAttestation: string;
  redirectUri: string;
  isNewApiEnabled: boolean;
};

/**
 * Function to complete the authentication flow. It must be invoked after `startAuthFlow`
 * and after obtaining the final `callbackUrl` from the WebView (CIE + PIN & SPID) or Browser (CIEID).
 * The rest of the parameters are those obtained from `startAuthFlow` + the wallet attestation.
 * @param walletAttestation - The wallet attestation.
 * @param callbackUrl - The callback url from which the code to get the access token is extracted.
 * @returns Authentication tokens.
 */
const completeAuthFlow = async (params: CompleteAuthFlowParams) =>
  params.isNewApiEnabled
    ? IssuanceUtilsV2.completeAuthFlow(
        params as IssuanceUtilsV2.CompleteAuthFlowParams
      )
    : IssuanceUtilsV1.completeAuthFlow(
        params as IssuanceUtilsV1.CompleteAuthFlowParams
      );

type PidIssuanceParams = {
  issuerConf: IssuerConfiguration;
  accessToken: CredentialAccessToken;
  clientId: string;
  dPoPContext: CryptoContext;
  credentialDefinition: CredentialAuthDetail;
  isNewApiEnabled: boolean;
};

/**
 * Function to get the PID, parse it and return it in {@link StoredCredential} format.
 * It must be called after `startAuthFlow` and `completeAuthFlow`.
 * @returns The stored credential.
 */
const getPid = async (params: PidIssuanceParams): Promise<StoredCredential> =>
  params.isNewApiEnabled
    ? IssuanceUtilsV2.getPid(params as IssuanceUtilsV2.PidIssuanceParams)
    : IssuanceUtilsV1.getPid(params as IssuanceUtilsV1.PidIssuanceParams);

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
 * @param env the environment currently in use
 * @param isL3 flag that indicates that we need to issue an L3 PID
 */
export const getIdpHint = (
  idCtx: IdentificationContext,
  env: Env,
  isL3: boolean
) => {
  if (isL3) {
    // When issuing an L3 PID, we should not provide an IDP hint
    return undefined;
  }

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
