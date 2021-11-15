import { combineReducers } from "redux";
import { Action } from "../../../../../../store/actions/types";
import searchPspReducer, { RemotePayPalPsp } from "./searchPsp";

export type OnboardPayPalState = {
  psp: RemotePayPalPsp;
};

export const onboardingPaypalReducer = combineReducers<
  OnboardPayPalState,
  Action
>({
  // the psp whose handle the payment for PayPal
  psp: searchPspReducer
});
