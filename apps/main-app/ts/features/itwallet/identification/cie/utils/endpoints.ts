import { Platform } from "react-native";

const BASE_UAT_URL = "https://collaudo.idserver.servizicie.interno.gov.it/idp/";

export const cieUatEndpoint = Platform.select({
  ios: `${BASE_UAT_URL}Authn/SSL/Login2?`,
  default: BASE_UAT_URL
});
