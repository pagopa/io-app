import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { WalletOnboardingOutcomeEnum } from "../types/OnboardingOutcomeEnum";

type PaymentOnboardingAnalyticsProps = {
  payment_method_selected: string;
};

type PaymentOnboardingContextualCardProps = {
  savedPaymentMethods: number;
};

export const getOnboardingPaymentMethodOutcomeEvent = (
  outcome: WalletOnboardingOutcomeEnum
) => {
  switch (outcome) {
    case WalletOnboardingOutcomeEnum.SUCCESS:
      return "ADD_PAYMENT_METHOD_UX_SUCCESS";
    case WalletOnboardingOutcomeEnum.AUTH_ERROR:
      return "PAYMENT_ADD_METHOD_AUTHORIZATION_DENIED";
    case WalletOnboardingOutcomeEnum.CANCELED_BY_USER:
      return "PAYMENT_ADD_METHOD_CANCELED_BY_USER";
    case WalletOnboardingOutcomeEnum.ALREADY_ONBOARDED:
      return "PAYMENT_ADD_METHOD_DUPLICATE_ERROR";
    case WalletOnboardingOutcomeEnum.BE_KO:
      return "PAYMENT_99_ERROR";
    case WalletOnboardingOutcomeEnum.BPAY_NOT_FOUND:
      return "PAYMENT_ADD_METHOD_BPAY_NOT_FOUND";
    case WalletOnboardingOutcomeEnum.PSP_ERROR_ONBOARDING:
      return "PAYMENT_PSP_ERROR";
    case WalletOnboardingOutcomeEnum.INVALID_SESSION:
    case WalletOnboardingOutcomeEnum.TIMEOUT:
      return "PAYMENT_SESSION_TIMEOUT";
    case WalletOnboardingOutcomeEnum.GENERIC_ERROR:
    default:
      return "PAYMENT_GENERIC_ERROR";
  }
};

export const trackAddOnboardingPaymentMethod = (
  outcome: WalletOnboardingOutcomeEnum,
  payment_method_selected: string | undefined
) => {
  void mixpanelTrack(
    getOnboardingPaymentMethodOutcomeEvent(outcome),
    buildEventProperties("UX", "screen_view", {
      payment_method_selected,
      payment_phase: "onboarding"
    })
  );
};

export const trackPaymentOnboardingErrorHelp = (
  props: Partial<PaymentOnboardingAnalyticsProps> & { error: string }
) => {
  void mixpanelTrack(
    "PAYMENT_ERROR_HELP",
    buildEventProperties("UX", "action", {
      payment_phase: "onboarding",
      ...props
    })
  );
};

export const trackPaymentOnboardingContextualCard = (props: {
  is_onboarded: boolean;
}) => {
  mixpanelTrack(
    `PAYMENT_METHOD_ONBOARDED`,
    buildEventProperties("TECH", undefined, props)
  );
};

// Events related to the Android webview contextual card onboarding flow
export const trackPaymentOnboardingUserCancellationRequest = (
  props: Partial<PaymentOnboardingContextualCardProps>
) => {
  mixpanelTrack(
    `PAYMENT_ONBOARDING_USER_CANCELLATION_REQUEST`,
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackPaymentOnboardingUserCancellationBack = (
  props: Partial<PaymentOnboardingContextualCardProps>
) => {
  mixpanelTrack(
    `PAYMENT_ONBOARDING_USER_CANCELLATION_BACK`,
    buildEventProperties("UX", "action", props)
  );
};

export const trackPaymentOnboardingUserCancellationContinue = (
  props: Partial<PaymentOnboardingContextualCardProps>
) => {
  mixpanelTrack(
    "PAYMENT_ONBOARDING_USER_CANCELLATION_CONTINUE",
    buildEventProperties("UX", "action", props)
  );
};
