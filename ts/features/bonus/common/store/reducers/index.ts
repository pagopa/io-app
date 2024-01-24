import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import cdcReducer, { CdcState } from "../../../cdc/store/reducers";
import cgnReducer, { CgnState } from "../../../cgn/store/reducers";
import svReducer, { SvState } from "../../../siciliaVola/store/reducers";
import availableBonusesReducer, {
  AvailableBonusTypesState
} from "./availableBonusesTypes";

export type BonusState = Readonly<{
  availableBonusTypes: AvailableBonusTypesState;
  cgn: CgnState;
  sv: SvState;
  cdc: CdcState;
}>;

const bonusReducer = combineReducers<BonusState, Action>({
  availableBonusTypes: availableBonusesReducer,
  cgn: cgnReducer,
  sv: svReducer,
  cdc: cdcReducer
});

export default bonusReducer;
