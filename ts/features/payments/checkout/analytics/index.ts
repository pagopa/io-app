import { getPeople, mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import {
  PaymentAnalyticsBrowserType,
  PaymentAnalyticsEditingType,
  PaymentAnalyticsPhase,
  PaymentAnalyticsPreselectedPspFlag,
  PaymentAnalyticsSelectedMethodFlag,
  PaymentAnalyticsSelectedPspFlag
} from "../../common/types/PaymentAnalytics";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";
import { WalletPaymentFailure } from "../types/WalletPaymentFailure";

export type PaymentAnalyticsProps = {
  data_entry: string;
  first_time_opening: string;
  organization_name: string;
  organization_fiscal_code: string;
  service_name: string;
  saved_payment_method: number;
  amount: string;
  expiration_date: string;
  payment_phase: PaymentAnalyticsPhase;
  attempt: number;
  saved_payment_method_unavailable: number;
  last_used_payment_method: string;
  payment_method_selected: string;
  payment_method_selected_flag: PaymentAnalyticsSelectedMethodFlag;
  preselected_psp_flag: PaymentAnalyticsPreselectedPspFlag;
  selected_psp_flag: PaymentAnalyticsSelectedPspFlag;
  psp_selected: string;
  editing: PaymentAnalyticsEditingType;
  browser_type: PaymentAnalyticsBrowserType;
};

const MYBANK_PSP_BANNER_ID = "mybank_psp_selection";

// eslint-disable-next-line complexity
const getPaymentAnalyticsEventFromFailureOutcome = (
  outcome: WalletPaymentOutcomeEnum
) => {
  switch (outcome) {
    case WalletPaymentOutcomeEnum.AUTH_ERROR:
      return "PAYMENT_AUTHORIZATION_DENIED_ERROR";
    case WalletPaymentOutcomeEnum.INVALID_DATA:
      return "PAYMENT_INVALID_DATA_ERROR";
    case WalletPaymentOutcomeEnum.TIMEOUT:
      return "PAYMENT_SESSION_TIMEOUT";
    case WalletPaymentOutcomeEnum.CIRCUIT_ERROR:
      return "PAYMENT_CIRCUIT_ERROR";
    case WalletPaymentOutcomeEnum.MISSING_FIELDS:
      return "PAYMENT_MISSING_FIELDS_ERROR";
    case WalletPaymentOutcomeEnum.INVALID_CARD:
      return "PAYMENT_INVALID_CARD_ERROR";
    case WalletPaymentOutcomeEnum.CANCELED_BY_USER:
      return "PAYMENT_USER_CANCELLATION";
    case WalletPaymentOutcomeEnum.EXCESSIVE_AMOUNT:
      return "PAYMENT_EXCESSIVE_AMOUNT_ERROR";
    case WalletPaymentOutcomeEnum.INVALID_METHOD:
      return "PAYMENT_INVALID_METHOD_ERROR";
    case WalletPaymentOutcomeEnum.INVALID_SESSION:
      return "PAYMENT_UNKNOWN_OUTCOME_ERROR";
    case WalletPaymentOutcomeEnum.METHOD_NOT_ENABLED:
      return "PAYMENT_TURNED_OFF_METHOD_ERROR";
    case WalletPaymentOutcomeEnum.GENERIC_ERROR:
      return "PAYMENT_GENERIC_ERROR";
    case WalletPaymentOutcomeEnum.PAYMENT_METHODS_NOT_AVAILABLE:
      return "PAYMENT_NO_METHOD_SAVED_ERROR";
    case WalletPaymentOutcomeEnum.PAYMENT_METHODS_EXPIRED:
      return "PAYMENT_METHOD_EXPIRED";
    case WalletPaymentOutcomeEnum.WAITING_CONFIRMATION_EMAIL:
      return "PAYMENT_UNKNOWN_OUTCOME_ERROR";
    case WalletPaymentOutcomeEnum.PAYMENT_REVERSED:
      return "PAYMENT_REVERSAL_ERROR";
    case WalletPaymentOutcomeEnum.IN_APP_BROWSER_CLOSED_BY_USER:
      return "PAYMENT_WEBVIEW_USER_CANCELLATION";
    case WalletPaymentOutcomeEnum.PAYPAL_REMOVED_ERROR:
      return "PAYMENT_METHOD_AUTHORIZATION_ERROR";
    case WalletPaymentOutcomeEnum.BE_NODE_KO:
      return "PAYMENT_99_ERROR";
    case WalletPaymentOutcomeEnum.INSUFFICIENT_AVAILABILITY_ERROR:
      return "PAYMENT_INSUFFICIENT_AVAILABILITY_ERROR";
    case WalletPaymentOutcomeEnum.CVV_ERROR:
      return "PAYMENT_CVV_ERROR";
    case WalletPaymentOutcomeEnum.PLAFOND_LIMIT_ERROR:
      return "PAYMENT_PLAFOND_LIMIT_ERROR";
    case WalletPaymentOutcomeEnum.KO_RETRIABLE:
      return "PAYMENT_KO_RETRIABLE";
    case WalletPaymentOutcomeEnum.ORDER_NOT_PRESENT:
      return "PAYMENT_ORDER_NOT_PRESENT";
    case WalletPaymentOutcomeEnum.DUPLICATE_ORDER:
      return "PAYMENT_DUPLICATE_ORDER";
    case WalletPaymentOutcomeEnum.PSP_ERROR:
      return "PAYMENT_PSP_ERROR";
    case WalletPaymentOutcomeEnum.AUTH_REQUEST_ERROR:
      return "PAYMENT_500_ERROR";
    default:
      return outcome;
  }
};

const getPaymentAnalyticsEventFromRequestFailure = (
  failure: WalletPaymentFailure
) => {
  switch (failure.faultCodeCategory) {
    case "PAYMENT_UNAVAILABLE":
      return "PAYMENT_TECHNICAL_ERROR";
    case "PAYMENT_DATA_ERROR":
      return "PAYMENT_DATA_ERROR";
    case "DOMAIN_UNKNOWN":
      return "PAYMENT_ORGANIZATION_ERROR";
    case "PAYMENT_ONGOING":
      return failure.faultCodeDetail
        ? `PAYMENT_${failure.faultCodeDetail}`
        : "PAYMENT_ONGOING_ERROR";
    case "PAYMENT_EXPIRED":
      return "PAYMENT_EXPIRED_ERROR";
    case "PAYMENT_CANCELED":
      return "PAYMENT_CANCELED_ERROR";
    case "PAYMENT_DUPLICATED":
      return "PAYMENT_ALREADY_PAID_ERROR";
    case "PAYMENT_UNKNOWN":
      return "PAYMENT_NOT_FOUND_ERROR";
    case "PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION":
      return "PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION";
    case "GENERIC_ERROR":
    case "PAYMENT_VERIFY_GENERIC_ERROR":
      return "PAYMENT_502_ERROR";
    case "PAYMENT_SLOWDOWN_ERROR":
      return "PAYMENT_SLOWDOWN_ERROR";
    default:
      return "PAYMENT_NOT_MAPPED_CATEGORY_ERROR";
  }
};

export const trackPaymentSummaryLoading = () => {
  void mixpanelTrack(
    "PAYMENT_SUMMARY_LOADING",
    buildEventProperties("UX", "control")
  );
};

export const trackPaymentSummaryInfoScreen = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_SUMMARY_INFO_SCREEN",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackPaymentSummaryNoticeCopy = (
  props: Partial<PaymentAnalyticsProps> & { code: string }
) => {
  void mixpanelTrack(
    "PAYMENT_VERIFICA_COPY_INFO",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentSummaryAmountInfo = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_AMOUNT_INFO",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentMethodSelection = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTION",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackPaymentMethodSelected = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTED",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentBack = (screen: string) => {
  void mixpanelTrack(
    "PAYMENT_BACK",
    buildEventProperties("UX", "action", {
      screen
    })
  );
};

export const trackPaymentMethodSelectionBackExit = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTION_BACK_EXIT",
    buildEventProperties("UX", "exit", props)
  );
};

export const trackPaymentMethodSelectionBackContinue = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTION_BACK_CONTINUE",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentMethodVerificaFatalError = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_VERIFICA_FATAL_ERROR",
    buildEventProperties("KO", undefined, props)
  );
};

export const trackPaymentFeeSelection = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_FEE_SELECTION",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackPaymentFeeSelected = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_FEE_SELECTED",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentSummaryScreen = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_SUMMARY",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackPaymentSummaryEditing = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_SUMMARY_EDITING",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentConversion = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_UX_CONVERSION",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentOutcomeSuccess = (
  props: Partial<PaymentAnalyticsProps>
) => {
  getPeople()?.increment("PAYMENT_COMPLETED", 1);
  void mixpanelTrack(
    "PAYMENT_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackPaymentOutcomeFailure = (
  outcome: WalletPaymentOutcomeEnum,
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    getPaymentAnalyticsEventFromFailureOutcome(outcome),
    buildEventProperties("KO", undefined, props)
  );
};

export const trackPaymentRequestFailure = (
  failure: WalletPaymentFailure,
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    getPaymentAnalyticsEventFromRequestFailure(failure),
    buildEventProperties("KO", undefined, props)
  );
};

export const trackPaymentErrorHelp = (
  props: Partial<PaymentAnalyticsProps> & { error: string }
) => {
  void mixpanelTrack(
    "PAYMENT_ERROR_HELP",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentNoSavedMethodContinue = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_NO_SAVED_METHOD_CONTINUE",
    buildEventProperties("UX", "action", props)
  );
};

export const trackOnboardPaymentMethodAction = (
  outcome: WalletPaymentOutcomeEnum,
  props: Partial<PaymentAnalyticsProps>
) => {
  switch (outcome) {
    case WalletPaymentOutcomeEnum.PAYMENT_METHODS_NOT_AVAILABLE:
      return trackPaymentNoSavedMethodContinue(props);
    case WalletPaymentOutcomeEnum.PAYMENT_METHODS_EXPIRED:
      return trackPaymentExpiredMethodContinue(props);
  }
};

export const trackOnboardPaymentMethodCloseAction = (
  outcome: WalletPaymentOutcomeEnum,
  props: Partial<PaymentAnalyticsProps>
) => {
  switch (outcome) {
    case WalletPaymentOutcomeEnum.PAYMENT_METHODS_NOT_AVAILABLE:
      return trackPaymentNoSavedMethodExit(props);
    case WalletPaymentOutcomeEnum.PAYMENT_METHODS_EXPIRED:
      return trackPaymentExpiredMethodExit(props);
  }
};

export const trackPaymentExpiredMethodContinue = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_EXPIRED_CONTINUE",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentNoSavedMethodExit = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_NO_SAVED_METHOD_EXIT",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentExpiredMethodExit = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_EXPIRED_DIFFERENT_METHOD",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentNoticeDataEntry = () => {
  void mixpanelTrack(
    "PAYMENT_NOTICE_DATA_ENTRY",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackPaymentOrganizationDataEntry = () => {
  void mixpanelTrack(
    "PAYMENT_ORGANIZATION_DATA_ENTRY",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackPaymentStartFlow = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_START_FLOW",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentsPspNotAvailableError = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_PSP_NOT_AVAILABLE_ERROR",
    buildEventProperties("KO", "screen_view", props)
  );
};

export const trackPaymentsPspNotAvailableSelectNew = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_PSP_NOT_AVAILABLE_SELECT_NEW",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentBrowserLanding = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_BROWSER_LANDING",
    buildEventProperties("TECH", undefined, props)
  );
};

export const trackPaymentUserCancellationRequest = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_USER_CANCELLATION_REQUEST",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackPaymentUserCancellationBack = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_USER_CANCELLATION_BACK",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentUserCancellationContinue = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_USER_CANCELLATION_CONTINUE",
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentMyBankPspBanner = () =>
  mixpanelTrack(
    "BANNER",
    buildEventProperties("UX", "screen_view", {
      banner_id: MYBANK_PSP_BANNER_ID,
      banner_page: "PAYMENT_PICK_PSP_SCREEN"
    })
  );

export const trackPaymentMyBankPspBannerClose = () =>
  mixpanelTrack(
    "CLOSE_BANNER",
    buildEventProperties("UX", "action", {
      banner_id: MYBANK_PSP_BANNER_ID,
      banner_page: "PAYMENT_PICK_PSP_SCREEN"
    })
  );
