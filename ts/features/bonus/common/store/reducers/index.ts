import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import bonusVacanzeReducer, {
  BonusVacanzeState
} from "../../../bonusVacanze/store/reducers";
import bpdReducer, { BpdState } from "../../../bpd/store/reducers";
import cdcReducer, { CdcState } from "../../../cdc/store/reducers";
import cgnReducer, { CgnState } from "../../../cgn/store/reducers";
import svReducer, { SvState } from "../../../siciliaVola/store/reducers";
import availableBonusesReducer, {
  AvailableBonusTypesState
} from "./availableBonusesTypes";

export type BonusState = Readonly<{
  availableBonusTypes: AvailableBonusTypesState;
  bonusVacanze: BonusVacanzeState;
  bpd: BpdState;
  cgn: CgnState;
  sv: SvState;
  cdc: CdcState;
}>;

const bonusReducer = combineReducers<BonusState, Action>({
  availableBonusTypes: availableBonusesReducer,
  bonusVacanze: bonusVacanzeReducer,
  bpd: bpdReducer,
  cgn: cgnReducer,
  sv: svReducer,
  cdc: cdcReducer
});

export default bonusReducer;
