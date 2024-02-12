import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import cdcReducer, { CdcState } from "../../../cdc/store/reducers";
import cgnReducer, { CgnState } from "../../../cgn/store/reducers";
import availableBonusesReducer, {
  AvailableBonusTypesState
} from "./availableBonusesTypes";

export type BonusState = Readonly<{
  availableBonusTypes: AvailableBonusTypesState;
  cgn: CgnState;
  cdc: CdcState;
}>;

const bonusReducer = combineReducers<BonusState, Action>({
  availableBonusTypes: availableBonusesReducer,
  cgn: cgnReducer,
  cdc: cdcReducer
});

export default bonusReducer;
