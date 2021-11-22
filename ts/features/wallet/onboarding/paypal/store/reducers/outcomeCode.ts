import { getType } from "typesafe-actions";

import { none, Option } from "fp-ts/lib/Option";
import { Action } from "../../../../../../store/actions/types";
import { walletAddPaypalStart, walletAddPaypaOutcome } from "../actions";
import { GlobalState } from "../../../../../../store/reducers/types";

export type PaypalOnboardingOutcomeCodeState = Option<string>;
const initialState = none;
const outcomeCodeReducer = (
  state: PaypalOnboardingOutcomeCodeState = initialState,
  action: Action
): PaypalOnboardingOutcomeCodeState => {
  switch (action.type) {
    // reset the state when paypal onboarding flow starts
    case getType(walletAddPaypalStart):
      return initialState;
    case getType(walletAddPaypaOutcome):
      return action.payload;
    default:
      return state;
  }
};

export const paypalOnboardingOutcomeCodeSelector = (
  state: GlobalState
): PaypalOnboardingOutcomeCodeState =>
  state.wallet.onboarding.paypal.outcomeCode;

export default outcomeCodeReducer;
