import { cieLoginFlowWithDevServerEnabled } from "../../../../../config";
import { isDevEnv } from "../../../../../utils/environment";

export type SpidLevel = "SpidL2" | "SpidL3";

export const cieFlowForDevServerEnabled =
  isDevEnv && cieLoginFlowWithDevServerEnabled;

export const getCieIDLoginUri = (
  spidLevel: SpidLevel,
  isUat: boolean,
  apiLoginUrlPrefix: string
) =>
  `${apiLoginUrlPrefix}/api/auth/v1/login?entityID=${
    isUat ? "xx_servizicie_coll" : "xx_servizicie"
  }&authLevel=${spidLevel}`;

/**
 * This function checks if the given `url` is an authentication url
 *
 * @property livello1 Refers to SpidL1
 * @property livello2 Refers to SpidL2
 * @property nextUrl Refers to SpidL3 for `iOS` and `android`
 * @property openApp Refers to SpidL3 for `android`
 * @returns A `boolean`
 */
export const isAuthenticationUrl = (url: string) => {
  const authUrlRegex = /\/(livello1|livello2|nextUrl|openApp)(\/|\?|$)/;

  return authUrlRegex.test(url);
};
