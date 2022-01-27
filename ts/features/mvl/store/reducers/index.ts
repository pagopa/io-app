import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { mvlByIdReducer, MvlByIdState } from "./byId";
import { mvlPreferencesReducer, MvlPreferences } from "./preferences";

export type MvlState = {
  byId: MvlByIdState;
  preferences: MvlPreferences;
};

export const mvlReducer = combineReducers<MvlState, Action>({
  // save, using the MVLId as key, the pot.Pot<MVLData, Error> response
  byId: mvlByIdReducer,

  preferences: mvlPreferencesReducer
});
