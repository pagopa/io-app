import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import itwCieReducer, { ItwCieState } from "./cie";
import itwRequirements, { ItwRequirementsState } from "./itwRequirements";

export type ItWalletState = {
  requirements: ItwRequirementsState;
  activation: ItwCieState;
};

const itwReducer = combineReducers<ItWalletState, Action>({
  requirements: itwRequirements,
  activation: itwCieReducer
});

export default itwReducer;
