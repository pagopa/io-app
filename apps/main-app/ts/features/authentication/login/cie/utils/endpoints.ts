import { Platform } from "react-native";

import { CieEnv } from ".";

// `null` means the CieManager default IDP (production) is used
const CIE_IDP_BASE_URL_MAP: Record<CieEnv, null | string> = {
  production: null,
  preprod: "https://preproduzione.idserver.servizicie.interno.gov.it/idp/"
};

/** Returns the custom IDP url for the given CIE environment, if any. */
export const getCieIdpUrl = (cieEnv: CieEnv) => {
  const baseUrl = CIE_IDP_BASE_URL_MAP[cieEnv];

  if (baseUrl === null) {
    return null;
  }

  return Platform.select({
    ios: `${baseUrl}Authn/SSL/Login2`,
    android: baseUrl,
    default: null
  });
};
