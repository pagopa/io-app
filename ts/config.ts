// Main config file. Mostly read the configuration from .env files

import * as t from "io-ts";
import { NonNegativeNumber } from "italia-ts-commons/lib/numbers";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Millisecond, Second } from "italia-ts-commons/lib/units";
import Config from "react-native-config";

// default repository for fetching app content (e.g. services metadata)
const DEFAULT_CONTENT_REPO_URL = "https://raw.githubusercontent.com/pagopa/io-services-metadata/master" as NonEmptyString;

// default timeout of fetch (in ms)
const DEFAULT_FETCH_TIMEOUT_MS = 8000;

// default max retries for fetch
const DEFAULT_FETCH_MAX_RETRIES = 3;

// default timeout of fetch for calling the pagoPA SOAP APIs
const DEFAULT_FETCH_PAGOPA_TIMEOUT_MS = 60000;

// default timeout of fetch for calling certain pagoPA Payment Manager APIs
// that usually take longer than the other APIs (e.g. the payment related
// operations)
const DEFAULT_FETCH_PAYMENT_MANAGER_LONG_TIMEOUT_MS = 10000;

// default seconds of background activity before asking the unlock code login
const DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S = 30;

// Default number of workers to fetch message.
const DEFAULT_TOT_MESSAGE_FETCH_WORKERS = 5;

export const environment: string = Config.ENVIRONMENT;
export const apiUrlPrefix: string = Config.API_URL_PREFIX;
export const pagoPaApiUrlPrefix: string = Config.PAGOPA_API_URL_PREFIX;
export const pagoPaApiUrlPrefixTest: string = Config.PAGOPA_API_URL_PREFIX_TEST;
export const backendStatusUrl: string = Config.BACKEND_STATUS_URL;
export const mixpanelToken: string = Config.MIXPANEL_TOKEN;
export const gcmSenderId: string = Config.GCM_SENDER_ID;
export const debugRemotePushNotification =
  Config.DEBUG_REMOTE_PUSH_NOTIFICATION === "YES";
export const isDebugBiometricIdentificationEnabled =
  Config.DEBUG_BIOMETRIC_IDENTIFICATION === "YES";
export const instabugToken: string = Config.INSTABUG_TOKEN;

export const bonusVacanzeEnabled: boolean =
  Config.BONUS_VACANZE_ENABLED === "YES";

export const myPortalEnabled: boolean = Config.MYPORTAL_ENABLED === "YES";

// version of ToS
export const tosVersion: NonNegativeNumber = 2.1 as NonNegativeNumber;

export const fetchTimeout = t.Integer.decode(
  parseInt(Config.FETCH_TIMEOUT_MS, 10)
).getOrElse(DEFAULT_FETCH_TIMEOUT_MS) as Millisecond;

export const fetchMaxRetries = t.Integer.decode(
  parseInt(Config.FETCH_MAX_RETRIES, 10)
).getOrElse(DEFAULT_FETCH_MAX_RETRIES);

export const fetchPagoPaTimeout = t.Integer.decode(
  parseInt(Config.FETCH_PAGOPA_TIMEOUT_MS, 10)
).getOrElse(DEFAULT_FETCH_PAGOPA_TIMEOUT_MS) as Millisecond;

export const fetchPaymentManagerLongTimeout = t.Integer.decode(
  parseInt(Config.FETCH_PAYMENT_MANAGER_TIMEOUT_MS, 10)
).getOrElse(DEFAULT_FETCH_PAYMENT_MANAGER_LONG_TIMEOUT_MS) as Millisecond;

export const backgroundActivityTimeout = t.Integer.decode(
  parseInt(Config.BACKGROUND_ACTIVITY_TIMEOUT_S, 10)
).getOrElse(DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S) as Second;

export const contentRepoUrl = NonEmptyString.decode(
  Config.CONTENT_REPO_URL
).getOrElse(DEFAULT_CONTENT_REPO_URL);

export const totMessageFetchWorkers = t.Integer.decode(
  parseInt(Config.TOT_MESSAGE_FETCH_WORKERS, 10)
).getOrElse(DEFAULT_TOT_MESSAGE_FETCH_WORKERS);

export const shouldDisplayVersionInfoOverlay =
  Config.DISPLAY_VERSION_INFO_OVERLAY === "YES";

export const shufflePinPadOnPayment =
  Config.SHUFFLE_PINPAD_ON_PAYMENT === "YES";

export const privacyUrl: string = t.string
  .decode(Config.PRIVACY_URL)
  .getOrElse("https://io.italia.it/app-content/tos_privacy.html");
