import { Action, combineReducers } from "redux";
import cgnActivationReducer, { ActivationState } from "./activation";

export type CgnState = {
  activation: ActivationState;
};

const cgnReducer = combineReducers<CgnState, Action>({
  activation: cgnActivationReducer
});

export default cgnReducer;
