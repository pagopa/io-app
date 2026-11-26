import { Platform } from "react-native";

export const BASE_IDP_URL = "https://idserver.servizicie.interno.gov.it/idp/";

export const getDefaultIdpUrl = () =>
  Platform.select({
    ios: `${BASE_IDP_URL}Authn/SSL/Login2?`,
    android: BASE_IDP_URL
  });
