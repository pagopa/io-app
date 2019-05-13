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
const DEFAULT_FETCH_TIMEOUT_MS = 5000;

// default max retries for fetch
const DEFAULT_FETCH_MAX_RETRIES = 3;

// default timeout of fetch for calling the PagoPA SOAP APIs
const DEFAULT_FETCH_PAGOPA_TIMEOUT_MS = 60000;

// default timeout of fetch for calling certain PagoPA Payment Manager APIs
// that usually take longer than the other APIs (e.g. the payment related
// operations)
const DEFAULT_FETCH_PAYMENT_MANAGER_LONG_TIMEOUT_MS = 10000;

// default seconds of background activity before asking the PIN login
const DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S = 30;

// Default number of workers to fetch message.
const DEFAULT_TOT_MESSAGE_FETCH_WORKERS = 5;

export const tosVersion: number = Config.TOS_VERSION;
export const environment: string = Config.ENVIRONMENT;
export const apiUrlPrefix: string = Config.API_URL_PREFIX;
export const pagoPaApiUrlPrefix: string = Config.PAGOPA_API_URL_PREFIX;
export const mixpanelToken: string = Config.MIXPANEL_TOKEN;
export const enableTestIdp = Config.ENABLE_TEST_IDP === "YES";
export const gcmSenderId: string = Config.GCM_SENDER_ID;
export const debugRemotePushNotification =
  Config.DEBUG_REMOTE_PUSH_NOTIFICATION === "YES";
export const isDebugBiometricIdentificationEnabled =
  Config.DEBUG_BIOMETRIC_IDENTIFICATION === "YES";
export const instabugToken: string = Config.INSTABUG_TOKEN;

export const fetchTimeout = t.Integer.decode(Config.FETCH_TIMEOUT_MS).getOrElse(
  DEFAULT_FETCH_TIMEOUT_MS
) as Millisecond;

export const fetchMaxRetries = t.Integer.decode(
  Config.FETCH_MAX_RETRIES
).getOrElse(DEFAULT_FETCH_MAX_RETRIES);

export const fetchPagoPaTimeout = t.Integer.decode(
  Config.FETCH_PAGOPA_TIMEOUT_MS
).getOrElse(DEFAULT_FETCH_PAGOPA_TIMEOUT_MS) as Millisecond;

export const fetchPaymentManagerLongTimeout = t.Integer.decode(
  Config.FETCH_PAYMENT_MANAGER_TIMEOUT_MS
).getOrElse(DEFAULT_FETCH_PAYMENT_MANAGER_LONG_TIMEOUT_MS) as Millisecond;

export const backgroundActivityTimeout = t.Integer.decode(
  Config.BACKGROUND_ACTIVITY_TIMEOUT_S
).getOrElse(DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S) as Second;

export const contentRepoUrl = NonEmptyString.decode(
  Config.CONTENT_REPO_URL
).getOrElse(DEFAULT_CONTENT_REPO_URL);

export const totMessageFetchWorkers = t.Integer.decode(
  Config.TOT_MESSAGE_FETCH_WORKERS
).getOrElse(DEFAULT_TOT_MESSAGE_FETCH_WORKERS);

export const shouldDisplayVersionInfoOverlay =
  Config.DISPLAY_VERSION_INFO_OVERLAY === "YES";

export function isDevEnvironment() {
  return environment === "DEV";
}
