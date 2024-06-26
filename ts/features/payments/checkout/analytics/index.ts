import { getType } from "typesafe-actions";
import { mixpanel, mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { paymentsGetPaymentDetailsAction } from "../store/actions/networking";
import { Action } from "../../../../store/actions/types";
import { PaymentAnalyticsEditingType, PaymentAnalyticsPhase, PaymentAnalyticsPreselectedPspFlag, PaymentAnalyticsSelectedMethodFlag, PaymentAnalyticsSelectedPspFlag } from "../types/PaymentAnalyticsSelectedMethodFlag";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";

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

export const getPaymentAnalyticsEventFromFailureOutcome = (outcome: WalletPaymentOutcomeEnum) => {
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
    default:
      return "PAYMENT_UNKNOWN_OUTCOME_ERROR";
  }
};


export const trackPaymentSummaryInfoScreen = (
  props: Partial<PaymentAnalyticsProps>
) => {
  console.log("PAYMENT_VERIFICA_LOADING", props);
  void mixpanelTrack(
    "PAYMENT_VERIFICA_LOADING",
    buildEventProperties("UX", "screen_view", {
      ...props
    })
  );
};

export const trackPaymentSummaryNoticeCopy = (
  props: Partial<PaymentAnalyticsProps> & { code: string }
) => {
  console.log("PAYMENT_VERIFICA_COPY_INFO", props);
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
  console.log("PAYMENT_AMOUNT_INFO", props);
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
  console.log("PAYMENT_METHOD_SELECTION", props);
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
  console.log("PAYMENT_METHOD_SELECTED", props);
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTED",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentBack = (
  screen: string,
) => {
  console.log("PAYMENT_BACK", screen);
  void mixpanelTrack(
    "PAYMENT_BACK",
    buildEventProperties("UX", "action", {
      screen
    })
  );
};

export const trackPaymentMethodSelectionBackExit = (props: Partial<PaymentAnalyticsProps>) => {
  console.log("PAYMENT_METHOD_SELECTION_BACK_EXIT", props);
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTION_BACK_EXIT",
    buildEventProperties("UX", "exit", {
      ...props
    })
  );
};

export const trackPaymentMethodSelectionBackContinue = (props: Partial<PaymentAnalyticsProps>) => {
  console.log("PAYMENT_METHOD_SELECTION_BACK_CONTINUE", props);
  void mixpanelTrack(
    "PAYMENT_METHOD_SELECTION_BACK_CONTINUE",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentMethodVerificaFatalError = (props: Partial<PaymentAnalyticsProps>) => {
  console.log("PAYMENT_VERIFICA_FATAL_ERROR", props);
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
  console.log("PAYMENT_FEE_SELECTION", props);
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
  console.log("PAYMENT_FEE_SELECTED", props);
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
  console.log("PAYMENT_SUMMARY", props);
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
  console.log("PAYMENT_SUMMARY_EDITING", props);
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
  console.log("PAYMENT_UX_CONVERSION", props);
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
  console.log("PAYMENT_UX_SUCCESS", props);
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
  console.log(getPaymentAnalyticsEventFromFailureOutcome(outcome), props);
  void mixpanelTrack(
    getPaymentAnalyticsEventFromFailureOutcome(outcome),
    buildEventProperties("KO", undefined, {
      ...props
    })
  );
};

export const trackPaymentsAction =
  (mp: NonNullable<typeof mixpanel>) =>
    (action: Action): void => {
      switch (action.type) {
        case getType(paymentsGetPaymentDetailsAction.request):
          return mp.track(
            "PAYMENT_VERIFICA_LOADING",
            buildEventProperties("UX", "control")
          );
      }
    };
