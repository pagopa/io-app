import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import itwRequirements, { ItwRequirementsState } from "./itwRequirements";
import itwCredentials, { ItwCredentialsState } from "./itwCredentials";

export type ItWalletState = {
  requirements: ItwRequirementsState;
  credentials: ItwCredentialsState;
};

const itwReducer = combineReducers<ItWalletState, Action>({
  requirements: itwRequirements,
  credentials: itwCredentials
});

export default itwReducer;
