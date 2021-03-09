import { Action, combineReducers } from "redux";
import eycaActivationReducer, { EycaActivationState } from "./activation";

export type EycaState = {
  activation: EycaActivationState;
};

const eycaReducer = combineReducers<EycaState, Action>({
  activation: eycaActivationReducer
});

export default eycaReducer;
