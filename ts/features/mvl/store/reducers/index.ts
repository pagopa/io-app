import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { mvlByIdReducer, MvlByIdState } from "./byId";

export type MvlState = {
  byId: MvlByIdState;
};

export const mvlReducer = combineReducers<MvlState, Action>({
  // save, using the MVLId as key, the pot.Pot<MVLData, Error> response
  byId: mvlByIdReducer
});
