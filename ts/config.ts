// Main config file. Mostly read the configuration from .env files

import { CommaSeparatedListOf } from "@pagopa/ts-commons/lib/comma-separated-list";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Millisecond, Second } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import Config from "react-native-config";

// default repository for fetching app content (e.g. services metadata)
const DEFAULT_CONTENT_REPO_URL =
  "https://assets.cdn.io.italia.it" as NonEmptyString;

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

// Default number of workers to fetch service.
const DEFAULT_TOT_SERVICE_FETCH_WORKERS = 5;

// TODO: calculate the page size based on available screen space and item's height
// https://pagopa.atlassian.net/browse/IA-474
const DEFAULT_PAGE_SIZE = 12;

export const environment: string = Config.ENVIRONMENT;
export const apiUrlPrefix: string = Config.API_URL_PREFIX;
export const pagoPaApiUrlPrefix: string = Config.PAGOPA_API_URL_PREFIX;
export const pagoPaApiUrlPrefixTest: string = Config.PAGOPA_API_URL_PREFIX_TEST;
export const mixpanelToken: string = Config.MIXPANEL_TOKEN;
export const debugRemotePushNotification =
  Config.DEBUG_REMOTE_PUSH_NOTIFICATION === "YES";
export const isDebugBiometricIdentificationEnabled =
  Config.DEBUG_BIOMETRIC_IDENTIFICATION === "YES";

export const bonusVacanzeEnabled: boolean =
  Config.BONUS_VACANZE_ENABLED === "YES";

export const myPortalEnabled: boolean = Config.MYPORTAL_ENABLED === "YES";

export const bpdEnabled: boolean = Config.BPD_ENABLED === "YES";

export const bpdApiUrlPrefix: string = Config.BPD_API_URL_PREFIX;

export const bpdApiSitUrlPrefix: string = Config.BPD_API_SIT;
export const bpdApiUatUrlPrefix: string = Config.BPD_API_UAT;

export const isPlaygroundsEnabled: boolean =
  Config.PLAYGROUNDS_ENABLED === "YES";

// EU Covid Certificate feature flag
export const euCovidCertificateEnabled: boolean =
  Config.EU_COVID_CERT_ENABLED === "YES";

// SiciliaVola Feature Flag
export const svEnabled: boolean = Config.SICILIAVOLA_ENABLED === "YES";

// Zendesk Feature Flag
export const zendeskEnabled: boolean = Config.ZENDESK_ENABLED === "YES";

// CGN new merchants features
export const cgnMerchantsV2Enabled = Config.CGN_MERCHANTS_V2_ENABLED === "YES";

// Opt-in payments method
export const bpdOptInPaymentMethodsEnabled =
  Config.BPD_OPT_IN_PAYMENT_METHODS === "YES";

// Ukraine donation
export const uaDonationsEnabled = Config.UA_DONATIONS_ENABLED === "YES";

// FIMS (Federated Identity Management System) Feature Flag
export const fimsEnabled = Config.FIMS_ENABLED === "YES";

// CdC (Carta della cultura) Feature Flag
export const cdcEnabled = Config.CDC_ENABLED === "YES";

// Premium Messages Opt-in/out Feature Flag
export const premiumMessagesOptInEnabled =
  Config.PREMIUM_MESSAGES_OPT_IN_ENABLED === "YES";

export const scanAdditionalBarcodesEnabled =
  Config.SCAN_ADDITIONAL_BARCODES_ENABLED === "YES";

// Redesign of the transaction summary screen
export const newTransactionSummaryEnabled =
  Config.NEW_TRANSACTION_SUMMARY_ENABLED === "YES";

// FCI (Firma con IO) Feature Flag
export const fciEnabled = Config.FCI_ENABLED === "YES";

// PN (Piattaforma Notifiche) Feature Flag
export const pnEnabled = Config.PN_ENABLED === "YES";

// Opt-in for reminder push notifications
export const remindersOptInEnabled = Config.REMINDERS_OPT_IN_ENABLED === "YES";

// version of ToS
export const tosVersion: NonNegativeNumber = 4.5 as NonNegativeNumber;

export const fetchTimeout = pipe(
  parseInt(Config.FETCH_TIMEOUT_MS, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_FETCH_TIMEOUT_MS)
) as Millisecond;

export const fetchMaxRetries = pipe(
  parseInt(Config.FETCH_MAX_RETRIES, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_FETCH_MAX_RETRIES)
);

export const fetchPagoPaTimeout = pipe(
  parseInt(Config.FETCH_PAGOPA_TIMEOUT_MS, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_FETCH_PAGOPA_TIMEOUT_MS)
) as Millisecond;

export const fetchPaymentManagerLongTimeout = pipe(
  parseInt(Config.FETCH_PAYMENT_MANAGER_TIMEOUT_MS, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_FETCH_PAYMENT_MANAGER_LONG_TIMEOUT_MS)
) as Millisecond;

export const backgroundActivityTimeout = pipe(
  parseInt(Config.BACKGROUND_ACTIVITY_TIMEOUT_S, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_BACKGROUND_ACTIVITY_TIMEOUT_S)
) as Second;

export const contentRepoUrl = pipe(
  Config.CONTENT_REPO_URL,
  NonEmptyString.decode,
  E.getOrElse(() => DEFAULT_CONTENT_REPO_URL)
);

export const totMessageFetchWorkers = pipe(
  parseInt(Config.TOT_MESSAGE_FETCH_WORKERS, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_TOT_MESSAGE_FETCH_WORKERS)
);

export const totServiceFetchWorkers = pipe(
  parseInt(Config.TOT_SERVICE_FETCH_WORKERS, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_TOT_SERVICE_FETCH_WORKERS)
);

export const shufflePinPadOnPayment =
  Config.SHUFFLE_PINPAD_ON_PAYMENT === "YES";

export const privacyUrl: string = pipe(
  Config.PRIVACY_URL,
  t.string.decode,
  E.getOrElse(() => "https://io.italia.it/app-content/tos_privacy.html")
);

export const zendeskPrivacyUrl: string = pipe(
  Config.ZENDESK_PRIVACY_URL,
  t.string.decode,
  E.getOrElse(() => "https://www.pagopa.it/it/privacy-policy-assistenza/")
);

export const localServicesWebUrl: string = pipe(
  Config.LOCAL_SERVICE_WEB_URL,
  t.string.decode,
  E.getOrElse(() => "https://io.italia.it")
);

export const unsupportedDeviceMoreInfoUrl: string = pipe(
  Config.UNSUPPORTED_DEVICE_MORE_INFO_URL,
  NonEmptyString.decode,
  E.getOrElse(() => "https://io.italia.it/app-content/unsupported_device.html")
);

export const unsupportedDeviceLearnMoreUrl: string = pipe(
  Config.UNSUPPORTED_DEVICE_LEARN_MORE_URL,
  NonEmptyString.decode,
  E.getOrElse(() => "https://io.italia.it/faq/#n1_11")
);

export const pageSize: number = DEFAULT_PAGE_SIZE;

// This is the maximum number supported by API via pagination regardless of the content.
export const maximumItemsFromAPI: number = 100;

export const testOverlayCaption: string | undefined =
  Config.TEST_OVERLAY_CAPTION;

/**
 * Payments
 */

// If not defined or invalid we don't want to filter PSPs
export const POSTE_DATAMATRIX_SCAN_PREFERRED_PSPS:
  | ReadonlyArray<NonEmptyString>
  | undefined = pipe(
  O.fromEither(
    CommaSeparatedListOf(NonEmptyString).decode(
      Config.POSTE_DATAMATRIX_SCAN_PREFERRED_PSPS_CSL
    )
  ),
  O.toUndefined
);

/**
 * IDPay
 */

export const idPayTestToken =
  Config.IDPAY_API_TEST_TOKEN !== "" ? Config.IDPAY_API_TEST_TOKEN : undefined;

export const idPayApiUatBaseUrl = Config.IDPAY_API_UAT_BASEURL;

export const idPayApiBaseUrl = Config.IDPAY_API_BASEURL;
