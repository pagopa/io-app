import { CieIdEnvironment } from "@pagopa/io-react-native-cieid";

import { cieLoginFlowWithDevServerEnabled } from "../../../../../config";
import { isDevEnv } from "../../../../../utils/environment";
import { AuthLevel, SPID_AUTH_LEVEL_MAP } from "../../../common/utils";

export const cieFlowForDevServerEnabled =
  isDevEnv && cieLoginFlowWithDevServerEnabled;

const CIE_IDP_ID_MAP: Record<"prod" | "uat", string> = {
  prod: "https://idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO",
  uat: "https://preproduzione.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO"
};

/**
 * Returns the CIE Identity Provider ID based on the UAT flag.
 */
export const getCieIdpId = (useUat: boolean) =>
  useUat ? CIE_IDP_ID_MAP.uat : CIE_IDP_ID_MAP.prod;

/**
 * Maps the CIE login UAT flag to the CieID app environment to open.
 */
export const getCieIdEnvironment = (isUat: boolean): CieIdEnvironment =>
  isUat ? "preprod" : "production";

export const getCieIDLoginUri = (
  authLevel: AuthLevel,
  isUat: boolean,
  apiLoginUrlPrefix: string
) =>
  `${apiLoginUrlPrefix}/api/auth/v1/login?entityID=${
    isUat ? "xx_servizicie_coll" : "xx_servizicie"
  }&authLevel=${SPID_AUTH_LEVEL_MAP[authLevel]}`;

/**
 * @description this function checks if the given `url` is an authentication url
 * @property livello1 refers to SpidL1
 * @property livello2 refers to SpidL2
 * @property nextUrl refers to SpidL3 for `iOS` and `android`
 * @property openApp refers to SpidL3 for `android`
 *
 * @returns a `boolean`
 */
export const isAuthenticationUrl = (url: string) => {
  const authUrlRegex = /\/(livello1|livello2|nextUrl|OpenApp)(\/|\?|$)/;

  return authUrlRegex.test(url);
};
