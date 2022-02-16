import PAYPAL_ROUTES from "./routes";

export type PaymentMethodOnboardingPayPalParamsList = {
  [PAYPAL_ROUTES.ONBOARDING.START]: undefined;
  [PAYPAL_ROUTES.ONBOARDING.SEARCH_PSP]: undefined;
  [PAYPAL_ROUTES.ONBOARDING.CHECKOUT]: undefined;
  [PAYPAL_ROUTES.ONBOARDING.CHECKOUT_COMPLETED]: undefined;
};
