import { Action, combineReducers } from "redux";
import cgnActivationReducer, { ActivationState } from "./activation";
import cgnDetailsReducer, { CgnDetailsState } from "./details";
import eycaReducer, { EycaState } from "./eyca";
import cgnMerchantsReducer, { CgnMerchantsState } from "./merchants";

export type CgnState = {
  activation: ActivationState;
  detail: CgnDetailsState;
  eyca: EycaState;
  merchants: CgnMerchantsState;
};

const cgnReducer = combineReducers<CgnState, Action>({
  activation: cgnActivationReducer,
  detail: cgnDetailsReducer,
  eyca: eycaReducer,
  merchants: cgnMerchantsReducer
});

export default cgnReducer;
