import * as pot from "italia-ts-commons/lib/pot";
import { BonusList } from "../../api/backendBonusVacanze";
import { GlobalState } from "../../../../store/reducers/types";
import { Action } from "redux";
export type BonusState = Readonly<{
  bonuses: pot.Pot<BonusList, Error>;
}>;

const INITIAL_STATE: BonusState = {
  bonuses: pot.none
};

const reducer = (
  state: BonusState = INITIAL_STATE,
  action: Action
): BonusState => {
  return state;
};

// Selectors
export const bonusList = (state: GlobalState): pot.Pot<BonusList, Error> =>
  state.bonus.bonuses;
