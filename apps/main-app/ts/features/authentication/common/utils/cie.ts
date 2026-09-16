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

/**
 * Checks whether `url`'s origin is one of the trusted CIE ID identity servers in `allowedOrigins`.
 */
export const isAllowedUrl = (
  url: string,
  allowedOrigins: ReadonlyArray<string>
) => {
  try {
    const { origin } = new URL(url);
    return allowedOrigins.includes(origin);
  } catch {
    return false;
  }
};

export type CieIdLoginProps = {
  isUat: boolean;
  spidLevel: AuthLevel;
};
