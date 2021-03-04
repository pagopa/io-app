import { Action, combineReducers } from "redux";
import cgnActivationReducer, { ActivationState } from "./activation";
import cgnDetailsReducer, { CgnDetailsState } from "./details";

export type CgnState = {
  activation: ActivationState;
  detail: CgnDetailsState;
};

const cgnReducer = combineReducers<CgnState, Action>({
  activation: cgnActivationReducer,
  detail: cgnDetailsReducer
});

export default cgnReducer;
