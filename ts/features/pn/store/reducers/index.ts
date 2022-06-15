import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { pnContentByIdReducer, PnContentByIdState } from "./contentById";
import { PnPreferences, pnPreferencesReducer } from "./preferences";

export type PnState = {
  preferences: PnPreferences;
  contentById: PnContentByIdState;
};

export const pnReducer = combineReducers<PnState, Action>({
  preferences: pnPreferencesReducer,
  contentById: pnContentByIdReducer
});
