import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { BonusList } from "../../types/bonusList";
import { EligibilityCheck } from "../../types/eligibility";
import {
  availableBonusesLoad,
  startBonusEligibility
} from "../actions/bonusVacanze";

export type BonusState = Readonly<{
  availableBonuses: pot.Pot<BonusList, Error>;
  eligibilityCheck: pot.Pot<EligibilityCheck, Error>;
}>;

const INITIAL_STATE: BonusState = {
  availableBonuses: pot.none,
  eligibilityCheck: pot.none
};

const reducer = (
  state: BonusState = INITIAL_STATE,
  action: Action
): BonusState => {
  switch (action.type) {
    // available bonuses
    case getType(availableBonusesLoad.request):
      return {
        ...state,
        availableBonuses: pot.toLoading(state.availableBonuses)
      };
    case getType(availableBonusesLoad.success):
      return { ...state, availableBonuses: pot.some(action.payload) };
    case getType(availableBonusesLoad.failure):
      return {
        ...state,
        availableBonuses: pot.toError(state.availableBonuses, action.payload)
      };
    // eligibility check
    case getType(startBonusEligibility.request):
      return {
        ...state,
        eligibilityCheck: pot.toLoading(state.eligibilityCheck)
      };
    case getType(startBonusEligibility.success):
      return {
        ...state,
        eligibilityCheck: pot.some(action.payload)
      };
    case getType(startBonusEligibility.failure):
      return {
        ...state,
        eligibilityCheck: pot.toError(state.eligibilityCheck, action.payload)
      };
  }
  return state;
};

// Selectors
export const availableBonuses = (
  state: GlobalState
): pot.Pot<BonusList, Error> => state.bonus.availableBonuses;

// if is some the eligibility result is available
export const eligibilityResult = (
  state: GlobalState
): Option<EligibilityCheck> =>
  // TODO this check is weak
  pot.toOption(
    pot.filter(state.bonus.eligibilityCheck, ec => ec.members !== undefined)
  );

export default reducer;
