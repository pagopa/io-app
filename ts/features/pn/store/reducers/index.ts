import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { PnPreferences, pnPreferencesReducer } from "./preferences";
import { pnActivationReducer, PnActivationState } from "./activation";

export type PnState = {
  preferences: PnPreferences;
  activation: PnActivationState;
};

export const pnReducer = combineReducers<PnState, Action>({
  preferences: pnPreferencesReducer,
  activation: pnActivationReducer
});
