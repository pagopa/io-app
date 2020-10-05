import { Action, combineReducers } from "redux";
import bpdActivationReducer, { BpdActivation } from "./activation";

export type BpdDetailsState = {
  activation: BpdActivation;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BpdDetailsState, Action>({
  activation: bpdActivationReducer
});

export default bpdDetailsReducer;
