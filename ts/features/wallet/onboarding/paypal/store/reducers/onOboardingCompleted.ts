import { getType } from "typesafe-actions";

import { Action } from "../../../../../../store/actions/types";
import {
  walletAddPaypalStart,
  OnOnboardingCompleted,
  walletAddPaypalCompleted,
  walletAddPaypalFailure,
  walletAddPaypalOutcome
} from "../actions";
import { GlobalState } from "../../../../../../store/reducers/types";

export type PaypalOnOnboardingCompletedState = Partial<{
  onCompleted: OnOnboardingCompleted;
  outcome: string;
}>;
const initialState: PaypalOnOnboardingCompletedState = {
  onCompleted: undefined,
  outcome: undefined
};
const onboardingCompletedReducer = (
  state: PaypalOnOnboardingCompletedState = initialState,
  action: Action
): PaypalOnOnboardingCompletedState => {
  switch (action.type) {
    case getType(walletAddPaypalStart):
      return { onCompleted: action.payload, outcome: undefined };
    case getType(walletAddPaypalOutcome):
      return { ...state, outcome: action.payload.toUndefined() };
    case getType(walletAddPaypalFailure):
    case getType(walletAddPaypalCompleted):
      return initialState;
    default:
      return state;
  }
};

export const paypalOnboardingCompletedSelector = (
  state: GlobalState
): PaypalOnOnboardingCompletedState["onCompleted"] =>
  state.wallet.onboarding.paypal.onboardingCompletion.onCompleted;

export const paypalOnboardingOutcomeCodeSelector = (
  state: GlobalState
): PaypalOnOnboardingCompletedState["outcome"] =>
  state.wallet.onboarding.paypal.onboardingCompletion.outcome;

export default onboardingCompletedReducer;
