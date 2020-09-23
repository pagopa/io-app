import { Action, combineReducers } from "redux";
import bpdDetailsReducer, { BdpDetailsState } from "./details";

export type BpdState = {
  details: BdpDetailsState;
};

const bpdReducer = combineReducers<BpdState, Action>({
  details: bpdDetailsReducer
});

export default bpdReducer;
