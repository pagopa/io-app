import { combineReducers } from "redux";
import { Action } from "../../../../../../store/actions/types";
import searchPspReducer, { RemotePayPalPsp } from "./searchPsp";
import selectedPspReducer, { PayPalSelectedPspState } from "./selectedPsp";
import onboardingCompletedReducer, {
  PaypalOnOnboardingCompletedState
} from "./onOboardingCompleted";

export type OnboardPayPalState = {
  psp: RemotePayPalPsp;
  selectedPsp: PayPalSelectedPspState;
  onboardingCompletion: PaypalOnOnboardingCompletedState;
};

export const onboardingPaypalReducer = combineReducers<
  OnboardPayPalState,
  Action
>({
  // the psp whose handle the payment for PayPal
  psp: searchPspReducer,
  // the psp selected to handle payments with PayPal
  selectedPsp: selectedPspReducer,
  // info about the onboarding completion
  onboardingCompletion: onboardingCompletedReducer
});
