import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import itwCieReducer, { ItwCieState } from "./cie";

export type ItwState = {
  itwActivation: ItwCieState;
};

const itwReducer = combineReducers<ItwState, Action>({
  itwActivation: itwCieReducer
});

export default itwReducer;
