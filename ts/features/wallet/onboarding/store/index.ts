import { Action, combineReducers } from "redux";
import bancomatReducer, { BancomatState } from "../bancomat/store/reducers";

export type PaymentMethodOnboardingState = {
  // The information related to adding new Bancomat to the wallet
  bancomat: BancomatState;
};

const onboardingReducer = combineReducers<PaymentMethodOnboardingState, Action>(
  {
    bancomat: bancomatReducer
  }
);

export default onboardingReducer;
