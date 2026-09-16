import { Platform } from "react-native";

import { AuthLevel } from ".";
import { isDevEnv } from "../../../../utils/environment";

export const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

export const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined
});

export const originSchemasWhiteList = [
  "https://*",
  "iologin://*",
  ...(isDevEnv ? ["http://*"] : [])
];

export const WHITELISTED_DOMAINS = [
  "https://idserver.servizicie.interno.gov.it",
  "https://oidc.idserver.servizicie.interno.gov.it",
  "https://mtls.oidc.idserver.servizicie.interno.gov.it",
  "https://mtls.idserver.servizicie.interno.gov.it",
  "https://ios.idserver.servizicie.interno.gov.it",
  "https://ios.oidc.idserver.servizicie.interno.gov.it",
  "https://preproduzione.idserver.servizicie.interno.gov.it"
];

/**
 * Checks whether `url`'s origin is one of the trusted CIE ID identity server in `WHITELISTED_DOMAINS`.
 */
export const isAllowedUrl = (url: string) => {
  try {
    const { origin } = new URL(url);
    return WHITELISTED_DOMAINS.includes(origin);
  } catch {
    return false;
  }
};

export type CieIdLoginProps = {
  isUat: boolean;
  spidLevel: AuthLevel;
};
