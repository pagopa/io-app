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
