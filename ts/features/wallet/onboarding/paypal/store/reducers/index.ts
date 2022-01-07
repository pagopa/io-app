import { combineReducers } from "redux";
import { Action } from "../../../../../../store/actions/types";
import searchPspReducer, { RemotePayPalPsp } from "./searchPsp";
import selectedPspReducer, { PayPalSelectedPspState } from "./selectedPsp";
import outcomeCodeReducer, {
  PaypalOnboardingOutcomeCodeState
} from "./outcomeCode";

export type OnboardPayPalState = {
  psp: RemotePayPalPsp;
  selectedPsp: PayPalSelectedPspState;
  outcomeCode: PaypalOnboardingOutcomeCodeState;
};

export const onboardingPaypalReducer = combineReducers<
  OnboardPayPalState,
  Action
>({
  // the psp whose handle the payment for PayPal
  psp: searchPspReducer,
  // the psp selected to handle payments with PayPal
  selectedPsp: selectedPspReducer,
  outcomeCode: outcomeCodeReducer
});
