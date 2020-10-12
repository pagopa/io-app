import { Action, combineReducers } from "redux";
import bancomatReducer, { BancomatState } from "../bancomat/store/reducers";

export type PaymentMethodOnboardingState = {
  bancomat: BancomatState;
};

const onboardingReducer = combineReducers<PaymentMethodOnboardingState, Action>(
  {
    bancomat: bancomatReducer
  }
);

export default onboardingReducer;
