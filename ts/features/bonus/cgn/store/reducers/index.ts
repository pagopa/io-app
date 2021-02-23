import { Action, combineReducers } from "redux";
import cgnActivationReducer, { ActivationState } from "./activation";
import cgnDetailsReducer, { CgnDetailsState } from "./details";
import cgnMerchantsReducer, { CgnMerchantsState } from "./merchants";

export type CgnState = {
  activation: ActivationState;
  detail: CgnDetailsState;
  merchants: CgnMerchantsState;
};

const cgnReducer = combineReducers<CgnState, Action>({
  activation: cgnActivationReducer,
  detail: cgnDetailsReducer,
  merchants: cgnMerchantsReducer
});

export default cgnReducer;
