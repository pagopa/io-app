import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import itwRequirements, { ItwRequirementsState } from "./itwRequirements";

export type ItWalletState = {
  requirements: ItwRequirementsState;
};

const itwReducer = combineReducers<ItWalletState, Action>({
  requirements: itwRequirements
});

export default itwReducer;
