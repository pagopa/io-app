import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { WalletOnboardingOutcomeEnum } from "../types/OnboardingOutcomeEnum";

export type PaymentOnboardingAnalyticsProps = {
  payment_method_selected: string;
};

const trackSuccessOnboardingPaymentMethod = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "ADD_PAYMENT_METHOD_UX_SUCCESS",
    buildEventProperties("UX", "screen_view", props)
  );
};

const trackOnboardingPaymentMethodDenied = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_ADD_METHOD_AUTHORIZATION_DENIED",
    buildEventProperties("UX", "screen_view", props)
  );
};

const trackAddOnboardingPaymentMethodCanceled = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_ADD_METHOD_CANCELED_BY_USER",
    buildEventProperties("UX", "screen_view", props)
  );
};

const trackAddOnboardingPaymentMethodDuplicated = (
  props: Partial<PaymentOnboardingAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_ADD_METHOD_DUPLICATE_ERROR",
    buildEventProperties("UX", "screen_view", props)
  );
};

// This function will be used in the future when we will have 3DS
// const trackOnboardingPaymentMethod3dsError = (
//   props: Partial<PaymentOnboardingAnalyticsProps>
// ) => {
//   void mixpanelTrack(
//     "PAYMENT_ADD_METHOD_3DS_ERROR",
//     buildEventProperties("UX", "screen_view", props)
//   );
// };

export const trackAddOnboardingPaymentMethod = (
  outcome: WalletOnboardingOutcomeEnum,
  payment_method_selected: string | undefined
) => {
  switch (outcome) {
    case WalletOnboardingOutcomeEnum.SUCCESS:
      trackSuccessOnboardingPaymentMethod({
        payment_method_selected
      });
      break;
    case WalletOnboardingOutcomeEnum.AUTH_ERROR:
      trackOnboardingPaymentMethodDenied({
        payment_method_selected
      });
      break;
    case WalletOnboardingOutcomeEnum.CANCELED_BY_USER:
      trackAddOnboardingPaymentMethodCanceled({
        payment_method_selected
      });
      break;
    case WalletOnboardingOutcomeEnum.ALREADY_ONBOARDED:
      trackAddOnboardingPaymentMethodDuplicated({
        payment_method_selected
      });
      break;
  }
};
