// Main config file. Mostly read the configuration from .env files

import { CommaSeparatedListOf } from "@pagopa/ts-commons/lib/comma-separated-list";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Millisecond, Second } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import Config from "react-native-config";

// default repository for fetching app content (e.g. services metadata)
const DEFAULT_CONTENT_REPO_URL =
  "https://assets.cdn.io.pagopa.it" as NonEmptyString;

const NEW_DEFAULT_CONTENT_REPO_URL =
  "https://assets.io.pagopa.it" as NonEmptyString;

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

// default fast login max retries
const DEFAULT_FAST_LOGIN_MAX_RETRIES = 3;

// Default number of workers to fetch message.
const DEFAULT_TOT_MESSAGE_FETCH_WORKERS = 5;

// TODO: calculate the page size based on available screen space and item's height
// https://pagopa.atlassian.net/browse/IA-474
const DEFAULT_PAGE_SIZE = 12;

// Default mixpanel EU url
const DEFAULT_MIXPANEL_URL = "https://api-eu.mixpanel.com";
// Default sentry dsn url
// This can be public as per docs https://docs.sentry.io/concepts/key-terms/dsn-explainer/#dsn-utilization
const DEFAULT_SENTRY_DSN =
  "https://43b87dcfc91f9cfdfaf71b254eb8f58e@o4507197393469440.ingest.de.sentry.io/4507221483585616";

export const environment: string = Config.ENVIRONMENT;
export const apiUrlPrefix: string = Config.API_URL_PREFIX;
export const apiLoginUrlPrefix: string = Config.API_LOGIN_URL_PREFIX;
export const pagoPaApiUrlPrefix: string = Config.PAGOPA_API_URL_PREFIX;
export const pagoPaApiUrlPrefixTest: string = Config.PAGOPA_API_URL_PREFIX_TEST;
export const mixpanelUrl = pipe(
  Config.MIXPANEL_URL,
  NonEmptyString.decode,
  E.getOrElse(() => DEFAULT_MIXPANEL_URL)
);
export const mixpanelToken: string = Config.MIXPANEL_TOKEN;
export const sentryDsn: string = pipe(
  Config.SENTRY_DSN,
  NonEmptyString.decode,
  E.getOrElse(() => DEFAULT_SENTRY_DSN)
);
export const isDebugBiometricIdentificationEnabled =
  Config.DEBUG_BIOMETRIC_IDENTIFICATION === "YES";

export const bonusApiUrlPrefix: string = Config.BONUS_API_URL_PREFIX;

export const isPlaygroundsEnabled: boolean =
  Config.PLAYGROUNDS_ENABLED === "YES";

// New locale selection
export const isAppLocaleSelectionEnabled: boolean =
  Config.APP_LOCALE_SELECTION_ENABLED === "YES";

// Zendesk Feature Flag
export const zendeskEnabled: boolean = Config.ZENDESK_ENABLED === "YES";

// CGN new merchants features
export const cgnMerchantsV2Enabled = Config.CGN_MERCHANTS_V2_ENABLED === "YES";

// CdC (Carta della cultura) Feature Flag
export const cdcEnabled = Config.CDC_ENABLED === "YES";

// Premium Messages Opt-in/out Feature Flag
export const premiumMessagesOptInEnabled =
  Config.PREMIUM_MESSAGES_OPT_IN_ENABLED === "YES";

export const scanAdditionalBarcodesEnabled =
  Config.SCAN_ADDITIONAL_BARCODES_ENABLED === "YES";

// FCI (Firma con IO) Feature Flag
export const fciEnabled = Config.FCI_ENABLED === "YES";

// SPID Relay State
export const spidRelayState = Config.SPID_RELAY_STATE;

// Fast Login Feature Flag
export const fastLoginEnabled = Config.FAST_LOGIN_ENABLED === "YES";

// Fast login bypass opt-in
export const fastLoginOptIn = Config.FAST_LOGIN_OPTIN === "YES";

// CIE Login Flow with dev server Feature Flag
export const cieLoginFlowWithDevServerEnabled =
  Config.CIE_LOGIN_WITH_DEV_SERVER_ENABLED === "YES";

// Native Login Feature Flag
export const nativeLoginEnabled = Config.NATIVE_LOGIN_ENABLED === "YES";

// #region Help Center URLs

/**
 * Help Center URL for the "What to do when the session is expired" article
 * hard-coded for now [by design]( https://www.figma.com/design/BDwCywRh6ibbfuvfq8DavO?node-id=12490-33508#1129981819)
 */
export const helpCenterHowToDoWhenSessionIsExpiredUrl =
  "https://assistenza.ioapp.it/hc/it/articles/32616176301713" as NonEmptyString;
/**
 * Help Center URL for the "How to login with SPID" article
 */
export const helpCenterHowToLoginWithSpidUrl =
  "https://assistenza.ioapp.it/hc/it/sections/30616637679505" as NonEmptyString;
/**
 * Help Center URL for the "How to login with EIC" article
 */
export const helpCenterHowToLoginWithEicUrl =
  "https://assistenza.ioapp.it/hc/it/articles/30724124984593#h_01JF0DQRRPJWY61RAFNG2AKF3R" as NonEmptyString;

// #endregion

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

export const newContentRepoUrl = pipe(
  Config.NEW_CONTENT_REPO_URL,
  NonEmptyString.decode,
  E.getOrElse(() => NEW_DEFAULT_CONTENT_REPO_URL)
);

export const totMessageFetchWorkers = pipe(
  parseInt(Config.TOT_MESSAGE_FETCH_WORKERS, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_TOT_MESSAGE_FETCH_WORKERS)
);

export const shufflePinPadOnPayment =
  Config.SHUFFLE_PINPAD_ON_PAYMENT === "YES";

export const zendeskPrivacyUrl: string = pipe(
  Config.ZENDESK_PRIVACY_URL,
  t.string.decode,
  E.getOrElse(() => "https://www.pagopa.it/it/privacy-policy-assistenza/")
);

export const cieSpidMoreInfoUrl: string = pipe(
  Config.CIE_SPID_INFORMATION_URL,
  NonEmptyString.decode,
  E.getOrElse(() => "https://identitadigitale.gov.it")
);

export const pinPukHelpUrl: string = pipe(
  Config.PIN_PUK_HELP_URL,
  NonEmptyString.decode,
  E.getOrElse(
    () =>
      "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk"
  )
);

export const fastLoginMaxRetries = pipe(
  parseInt(Config.FAST_LOGIN_MAX_RETRIES, 10),
  t.Integer.decode,
  E.getOrElse(() => DEFAULT_FAST_LOGIN_MAX_RETRIES)
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
export const idPayApiUatVersion = Config.IDPAY_API_UAT_VERSION;

export const idPayApiBaseUrl = Config.IDPAY_API_BASEURL;
export const idPayApiVersion = Config.IDPAY_API_VERSION;

export const walletApiBaseUrl = Config.WALLET_API_BASEURL;
export const walletApiUatBaseUrl = Config.WALLET_API_UAT_BASEURL;

// Default pin for dev mode
export const defaultPin = "162534";
