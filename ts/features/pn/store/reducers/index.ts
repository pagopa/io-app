import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { PnPreferences, pnPreferencesReducer } from "./preferences";

export type PnState = {
  preferences: PnPreferences;
};

export const pnReducer = combineReducers<PnState, Action>({
  preferences: pnPreferencesReducer
});
