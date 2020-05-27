import { fromPredicate, none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { BonusList } from "../../types/bonusList";
import { EligibilityCheck } from "../../types/eligibility";
import {
  availableBonusesLoad,
  checkBonusEligibility
} from "../actions/bonusVacanze";

export type BonusState = Readonly<{
  availableBonuses: pot.Pot<BonusList, Error>;
  eligibility: pot.Pot<EligibilityCheck, Error>;
}>;

const INITIAL_STATE: BonusState = {
  availableBonuses: pot.none,
  eligibility: pot.none
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
    // eligibility start
    // eligibility check
    case getType(checkBonusEligibility.request):
      return {
        ...state,
        eligibility: pot.toLoading(state.eligibility)
      };
    case getType(checkBonusEligibility.success):
      return {
        ...state,
        eligibility: pot.some(action.payload)
      };
    case getType(checkBonusEligibility.failure):
      return {
        ...state,
        eligibility: pot.toError(state.eligibility, action.payload)
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
): Option<EligibilityCheck> => pot.toOption(state.bonus.eligibility);

// return true if the polling exceeded the time threshold and we hadn't no response
export const isPollingExceeded = (state: GlobalState): boolean => {
  const el = state.bonus.eligibility;
  return pot.isSome(el) && pot.isError(el);
};

export default reducer;
