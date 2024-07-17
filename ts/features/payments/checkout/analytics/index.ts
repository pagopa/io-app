import { mixpanelTrack, mixpanel } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { PaymentsTrackingConfiguration } from "../../common/analytics";
import {
  PaymentAnalyticsEditingType,
  PaymentAnalyticsPhase,
  PaymentAnalyticsPreselectedPspFlag,
  PaymentAnalyticsSelectedMethodFlag,
  PaymentAnalyticsSelectedPspFlag
} from "../types/PaymentAnalytics";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";
import { WalletPaymentFailure } from "../types/WalletPaymentFailure";

export type PaymentAnalyticsProps = {
  data_entry: string;
  first_time_opening: string;
  organization_name: string;
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
  editing: PaymentAnalyticsEditingType;
};

export const getPaymentAnalyticsEventFromFailureOutcome = (
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
    default:
      return outcome;
  }
};

export const getPaymentAnalyticsEventFromRequestFailure = (
  falure: WalletPaymentFailure
) => {
  switch (falure.faultCodeCategory) {
    case "PAYMENT_UNAVAILABLE":
      return "PAYMENT_TECHNICAL_ERROR";
    case "PAYMENT_DATA_ERROR":
      return "PAYMENT_DATA_ERROR";
    case "DOMAIN_UNKNOWN":
      return "PAYMENT_ORGANIZATION_ERROR";
    case "PAYMENT_ONGOING":
      return "PAYMENT_ONGOING_ERROR";
    case "PAYMENT_EXPIRED":
      return "PAYMENT_EXPIRED_ERROR";
    case "PAYMENT_CANCELED":
      return "PAYMENT_CANCELED_ERROR";
    case "PAYMENT_DUPLICATED":
      return "PAYMENT_ALREADY_PAID_ERROR";
    case "PAYMENT_UNKNOWN":
      return "PAYMENT_NOT_FOUND_ERROR";
    default:
      return "PAYMENT_GENERIC_ERROR";
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
    buildEventProperties("UX", "screen_view", {
      ...props
    })
  );
};

export const trackPaymentSummaryNoticeCopy = (
  props: Partial<PaymentAnalyticsProps> & { code: string }
) => {
  void mixpanelTrack(
    "PAYMENT_VERIFICA_COPY_INFO",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentSummaryAmountInfo = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_AMOUNT_INFO",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentMethodSelection = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTION",
    buildEventProperties("UX", "screen_view", {
      ...props
    })
  );
};

export const trackPaymentMethodSelected = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTED",
    buildEventProperties("UX", "action", {
      ...props
    })
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
    buildEventProperties("UX", "exit", {
      ...props
    })
  );
};

export const trackPaymentMethodSelectionBackContinue = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTION_BACK_CONTINUE",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentMethodVerificaFatalError = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_VERIFICA_FATAL_ERROR",
    buildEventProperties("KO", undefined, {
      ...props
    })
  );
};

export const trackPaymentFeeSelection = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_FEE_SELECTION",
    buildEventProperties("UX", "screen_view", {
      ...props
    })
  );
};

export const trackPaymentFeeSelected = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_FEE_SELECTED",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentSummaryScreen = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_SUMMARY",
    buildEventProperties("UX", "screen_view", {
      ...props
    })
  );
};

export const trackPaymentSummaryEditing = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_SUMMARY_EDITING",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentConversion = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_UX_CONVERSION",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentOutcomeSuccess = (
  props: Partial<PaymentAnalyticsProps>
) => {
  mixpanel
    ?.getPeople()
    .increment("paymentsCompleted" as keyof PaymentsTrackingConfiguration, 1);
  void mixpanelTrack(
    "PAYMENT_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      ...props
    })
  );
};

export const trackPaymentOutcomeFailure = (
  outcome: WalletPaymentOutcomeEnum,
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    getPaymentAnalyticsEventFromFailureOutcome(outcome),
    buildEventProperties("KO", undefined, {
      ...props
    })
  );
};

export const trackPaymentRequestFailure = (
  failure: WalletPaymentFailure,
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    getPaymentAnalyticsEventFromRequestFailure(failure),
    buildEventProperties("KO", undefined, {
      ...props
    })
  );
};

export const trackPaymentErrorHelp = (
  props: Partial<PaymentAnalyticsProps> & { error: string }
) => {
  void mixpanelTrack(
    "PAYMENT_ERROR_HELP",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentMethodErrorContinue = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_ERROR_CONTINUE",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentMethodErrorExit = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_METHOD_ERROR_EXIT",
    buildEventProperties("UX", "action", {
      ...props
    })
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
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};
