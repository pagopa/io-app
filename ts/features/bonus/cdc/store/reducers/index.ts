import { combineReducers } from "redux";
import cdcBonusRequestReducer, {
  CdcBonusRequestState
} from "./cdcBonusRequest";

export type CdcState = {
  bonusRequest: CdcBonusRequestState;
};

const cdcReducer = combineReducers<CdcState>({
  bonusRequest: cdcBonusRequestReducer
});

export default cdcReducer;
