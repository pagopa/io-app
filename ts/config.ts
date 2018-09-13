// Main config file. Mostly read the configuration from .env files

import * as t from "io-ts";

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Millisecond, Second } from "italia-ts-commons/lib/units";
import Config from "react-native-config";

// default application name to show in the header of the topmost screens
export const DEFAULT_APPLICATION_NAME = "io.italia.it";

// default repository for fetching app content (e.g. services metadata)
const DEFAULT_CONTENT_REPO_URL = "https://raw.githubusercontent.com/teamdigitale/italia-services-metadata/master" as NonEmptyString;

// default timeout of fetch (in ms)
const DEFAULT_FETCH_TIMEOUT_MS = 3000;

// default max retries for fetch
const DEFAULT_FETCH_MAX_RETRIES = 3;

// default timeout of fetch for calling the PagoPA SOAP APIs
const DEFAULT_FETCH_PAGOPA_TIMEOUT_MS = 15000;

// default seconds of background activity before asking the PIN login
const DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S = 30;

export const environment = Config.ENVIRONMENT;
export const apiUrlPrefix = Config.API_URL_PREFIX;
export const pagoPaApiUrlPrefix = Config.PAGOPA_API_URL_PREFIX;
export const mixpanelToken = Config.MIXPANEL_TOKEN;
export const enableTestIdp = Config.ENABLE_TEST_IDP === "YES";
export const gcmSenderId = Config.GCM_SENDER_ID;
export const debugRemotePushNotification =
  Config.DEBUG_REMOTE_PUSH_NOTIFICATION === "YES";

export const fetchTimeout = t.Integer.decode(Config.FETCH_TIMEOUT_MS).getOrElse(
  DEFAULT_FETCH_TIMEOUT_MS
) as Millisecond;

export const fetchMaxRetries = t.Integer.decode(
  Config.FETCH_MAX_RETRIES
).getOrElse(DEFAULT_FETCH_MAX_RETRIES);

export const fetchPagoPaTimeout = t.Integer.decode(
  Config.FETCH_PAGOPA_TIMEOUT_MS
).getOrElse(DEFAULT_FETCH_PAGOPA_TIMEOUT_MS) as Millisecond;

export const backgroundActivityTimeout = t.Integer.decode(
  Config.BACKGROUND_ACTIVITY_TIMEOUT_S
).getOrElse(DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S) as Second;

export const contentRepoUrl = NonEmptyString.decode(
  Config.CONTENT_REPO_URL
).getOrElse(DEFAULT_CONTENT_REPO_URL);

export function isDevEnvironment() {
  return environment === "DEV";
}
