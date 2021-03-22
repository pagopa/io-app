import { Action, combineReducers } from "redux";
import cgnActivationReducer, { ActivationState } from "./activation";
import cgnDetailsReducer, { CgnDetailsState } from "./details";
import eycaReducer, { EycaState } from "./eyca";
import cgnMerchantsReducer, { CgnMerchantsState } from "./merchants";
import cgnOtpReducer, { CgnOtpState } from "./otp";

export type CgnState = {
  activation: ActivationState;
  detail: CgnDetailsState;
  eyca: EycaState;
  merchants: CgnMerchantsState;
  otp: CgnOtpState;
};

const cgnReducer = combineReducers<CgnState, Action>({
  activation: cgnActivationReducer,
  detail: cgnDetailsReducer,
  merchants: cgnMerchantsReducer,
  otp: cgnOtpReducer,
  eyca: eycaReducer
});

export default cgnReducer;
