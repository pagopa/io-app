import { Platform } from "react-native";

const BASE_UAT_URL =
  "https://preproduzione.idserver.servizicie.interno.gov.it/idp/";

export const getCieUatEndpoint = () =>
  Platform.select({
    ios: `${BASE_UAT_URL}Authn/SSL/Login2`,
    android: BASE_UAT_URL,
    default: null
  });
