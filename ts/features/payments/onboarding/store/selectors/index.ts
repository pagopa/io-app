import { GlobalState } from "../../../../../store/reducers/types";

const walletOnboardingSelector = (state: GlobalState) =>
  state.features.payments.onboarding;

export const selectPaymentOnboardingRequestResult = (state: GlobalState) =>
  walletOnboardingSelector(state).result;

export const selectPaymentOnboardingMethods = (state: GlobalState) =>
  walletOnboardingSelector(state).paymentMethods;

export const selectPaymentOnboardingSelectedMethod = (state: GlobalState) =>
  walletOnboardingSelector(state).selectedPaymentMethodId;
