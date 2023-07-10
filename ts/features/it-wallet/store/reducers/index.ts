import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import itwRequirements, { ItwRequirementsState } from "./itwRequirements";

export type ItWalletState = {
  itwRequirements: ItwRequirementsState;
};

const itwReducer = combineReducers<ItWalletState, Action>({
  itwRequirements
});

export default itwReducer;
