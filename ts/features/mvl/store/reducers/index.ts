import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import { mvlByIdReducer, MVLByIdState } from "./byId";

export type MVLState = {
  byId: MVLByIdState;
};

export const mvlReducer = combineReducers<MVLState, Action>({
  // save, using the MVLId as key, the pot.Pot<MVLData, Error> response
  byId: mvlByIdReducer
});
