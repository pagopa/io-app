import { Platform } from "react-native";

import { cieLoginFlowWithDevServerEnabled } from "../../../../../config";
import { isDevEnv } from "../../../../../utils/environment";
import { AuthLevel, SPID_AUTH_LEVEL_MAP } from "../../../common/utils";

export const CIE_ENVS = {
  PROD: "production",
  PREPROD: "preprod"
} as const;

export type CieEnv = (typeof CIE_ENVS)[keyof typeof CIE_ENVS];

export const cieFlowForDevServerEnabled =
  isDevEnv && cieLoginFlowWithDevServerEnabled;

const CIE_IDP_ID_MAP: Record<CieEnv, string> = {
  production:
    "https://idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO",
  preprod:
    "https://preproduzione.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO"
};

const CIE_ENTITY_ID_MAP: Record<CieEnv, string> = {
  production: "xx_servizicie",
  preprod: "xx_servizicie_coll"
};

/** Returns the CIE Identity Provider ID for the given CIE environment. */
export const getCieIdpId = (cieEnv: CieEnv) => CIE_IDP_ID_MAP[cieEnv];

/** Returns the CIE entity ID for the given CIE environment. */
export const getCieEntityId = (cieEnv: CieEnv) => CIE_ENTITY_ID_MAP[cieEnv];

export const getCieIDLoginUri = (
  authLevel: AuthLevel,
  cieEnv: CieEnv,
  apiLoginUrlPrefix: string
) =>
  `${apiLoginUrlPrefix}/api/auth/v1/login?entityID=${getCieEntityId(
    cieEnv
  )}&authLevel=${SPID_AUTH_LEVEL_MAP[authLevel]}`;

/**
 * Checks if the given `url` must be handed over to the CieID app to
 * authenticate the user, instead of being loaded in the login WebView.
 *
 * - `livello1` and `livello2` are the SpidL1 and SpidL2 login pages
 * - `nextUrl` and `OpenApp` are the SpidL3 app-to-app URLs
 * - `livello3` is the SpidL3 login page and it is handed over on iOS only. On
 *   Android it must be loaded in the WebView: the page redirects to `OpenApp`,
 *   the only SpidL3 URL the Android CieID app accepts. Forwarding `livello3`
 *   makes CieID close immediately and the login fails as cancelled.
 */
export const isAuthenticationUrl = (url: string) =>
  Platform.select({
    ios: /\/(livello1|livello2|livello3|nextUrl|OpenApp)(\/|\?|$)/,
    default: /\/(livello1|livello2|nextUrl|OpenApp)(\/|\?|$)/
  }).test(url);
