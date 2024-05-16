import { combineReducers } from "redux";
import eidReducer, { ItwIssuanceEidState } from "./eid";

export type ItwIssuanceState = {
  eid: ItwIssuanceEidState;
};

const itwIssuanceReducer = combineReducers({
  eid: eidReducer
});

export default itwIssuanceReducer;
