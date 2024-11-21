import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

export type PaymentOnboardingAnalyticsProps = {
  payment_method_selected: string;
};

export const trackSuccessOnboardingPaymentMethod = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "ADD_PAYMENT_METHOD_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", props)
  );
};
