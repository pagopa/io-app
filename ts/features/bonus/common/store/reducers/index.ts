import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import cgnReducer, { CgnState } from "../../../cgn/store/reducers";
import availableBonusesReducer, {
  AvailableBonusTypesState
} from "./availableBonusesTypes";

export type BonusState = Readonly<{
  availableBonusTypes: AvailableBonusTypesState;
  cgn: CgnState;
}>;

const bonusReducer = combineReducers<BonusState, Action>({
  availableBonusTypes: availableBonusesReducer,
  cgn: cgnReducer
});

export default bonusReducer;
