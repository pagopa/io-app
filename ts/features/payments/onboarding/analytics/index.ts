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

export const trackOnboardingPaymentMethodDenied = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_ADD_METHOD_AUTHORIZATION_DENIED",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackAddOnboardingPaymentMethodCanceled = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_ADD_METHOD_CANCELED_BY_USER",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackAddOnboardingPaymentMethodDuplicated = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_ADD_METHOD_DUPLICATE_ERROR",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackOnboardingPaymentMethod3dsError = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_ADD_METHOD_3DS_ERROR",
    buildEventProperties("UX", "screen_view", props)
  );
};
