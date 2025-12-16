import { Platform } from "react-native";
import { isDevEnv } from "../../../../../utils/environment";
import { SpidLevel } from "../utils";

export type WebViewLoginNavigationProps = {
  spidLevel: SpidLevel;
  isUat: boolean;
};

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
  "https://ios.oidc.idserver.servizicie.interno.gov.it"
];

export type CieIdLoginProps = {
  spidLevel: SpidLevel;
  isUat: boolean;
};
