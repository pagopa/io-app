import { getType } from "typesafe-actions";
import { mixpanel, mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { paymentsGetPaymentDetailsAction } from "../store/actions/networking";
import { Action } from "../../../../store/actions/types";

export type PaymentAnalyticsProps = {
  data_entry: string;
  first_time_opening: string;
  organization_name: string;
  service_name: string;
  saved_payment_method: number;
  amount: string;
  expiration_date: string;
};

export const trackPaymentSummaryInfoScreen = (
  props: Partial<PaymentAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_VERIFICA_LOADING",
    buildEventProperties("UX", "screen_view", {
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
      case getType(paymentsGetPaymentDetailsAction.success):
        const paymentDetails = action.payload;
        return mp.track(
          "PAYMENT_SUMMARY_INFO_SCREEN",
          buildEventProperties("UX", "screen_view", {
            data_entry: "TODO",
            first_time_opening: "TODO",
            organization_name: paymentDetails.paFiscalCode,
            service_name: "service_name",
            saved_payment_method: "saved_payment_method",
            amount: paymentDetails.amount,
            expiration_date: paymentDetails.dueDate
          })
        );
    }
  };
