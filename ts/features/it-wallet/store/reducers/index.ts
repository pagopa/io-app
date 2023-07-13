import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import itwCieReducer, { ItwCieState } from "./cie";
import itwRequirements, { ItwRequirementsState } from "./itwRequirements";
import itwCredentials, { ItwCredentialsState } from "./itwCredentials";

export type ItWalletState = {
  requirements: ItwRequirementsState;
  credentials: ItwCredentialsState;
  activation: ItwCieState;
};

const itwReducer = combineReducers<ItWalletState, Action>({
  requirements: itwRequirements,
  credentials: itwCredentials,
  activation: itwCieReducer
});

export default itwReducer;
