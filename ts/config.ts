// Main config file. Mostly read the configuration from .env files

import Config from "react-native-config";

export const environment = Config.ENVIRONMENT;
export const apiUrlPrefix = Config.API_URL_PREFIX;
export const mixpanelToken = Config.MIXPANEL_TOKEN;
export const enableTestIdp = Config.ENABLE_TEST_IDP === "YES";
export const debugRemotePushNotification = Config.DEBUG_REMOTE_PUSH_NOTIFICATION === "YES";
