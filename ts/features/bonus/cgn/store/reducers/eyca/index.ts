import { Action, combineReducers } from "redux";
import eycaActivationReducer, { EycaActivationState } from "./activation";
import eycaDetailsReducer, { EycaDetailsState } from "./details";

export type EycaState = {
  activation: EycaActivationState;
  details: EycaDetailsState;
};

const eycaReducer = combineReducers<EycaState, Action>({
  activation: eycaActivationReducer,
  details: eycaDetailsReducer
});

export default eycaReducer;
