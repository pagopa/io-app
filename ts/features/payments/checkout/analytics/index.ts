import { getType } from "typesafe-actions";
import { mixpanel, mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { paymentsGetPaymentDetailsAction } from "../store/actions/networking";
import { Action } from "../../../../store/actions/types";
import { PaymentAnalyticsSelectedMethodFlag } from "../types/PaymentAnalyticsSelectedMethodFlag";

export type PaymentAnalyticsProps = {
  data_entry: string;
  first_time_opening: string;
  organization_name: string;
  service_name: string;
  saved_payment_method: number;
  amount: string;
  expiration_date: string;
  attempt: number;
  saved_payment_method_unavailable: number;
  last_used_payment_method: string;
  payment_method_selected: string;
  payment_method_selected_flag: PaymentAnalyticsSelectedMethodFlag;
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
