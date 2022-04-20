import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { mvlByIdReducer, MvlByIdState } from "./byId";
import { mvlPreferencesReducer, MvlPreferences } from "./preferences";
import { MvlDownloads, mvlDownloadsReducer } from "./downloads";

export type MvlState = {
  byId: MvlByIdState;
  downloads: MvlDownloads;
  preferences: MvlPreferences;
};

export const mvlReducer = combineReducers<MvlState, Action>({
  // save, using the MVLId as key, the pot.Pot<MVLData, Error> response
  byId: mvlByIdReducer,
  downloads: mvlDownloadsReducer,
  preferences: mvlPreferencesReducer
});
