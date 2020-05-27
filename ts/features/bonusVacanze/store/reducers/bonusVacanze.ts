import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { BonusList } from "../../types/bonusList";
import { EligibilityCheck, EligibilityId } from "../../types/eligibility";
import {
  availableBonusesLoad,
  checkBonusEligibility,
  startBonusEligibility
} from "../actions/bonusVacanze";

type Eligibility = {
  id: pot.Pot<EligibilityId, Error>;
  check: pot.Pot<EligibilityCheck, Error>;
};

export type BonusState = Readonly<{
  availableBonuses: pot.Pot<BonusList, Error>;
  eligibility: Eligibility;
}>;

const INITIAL_STATE: BonusState = {
  availableBonuses: pot.none,
  eligibility: { id: pot.none, check: pot.none }
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
    case getType(startBonusEligibility.request):
      const eligibility = {
        ...state.eligibility,
        id: pot.toLoading(state.eligibility.id)
      };
      return {
        ...state,
        eligibility
      };
    case getType(startBonusEligibility.success):
      const eligibilityS = {
        ...state.eligibility,
        id: pot.some(action.payload)
      };
      return {
        ...state,
        eligibility: eligibilityS
      };
    case getType(startBonusEligibility.failure):
      const eligibilityF = {
        ...state.eligibility,
        id: pot.toError(state.eligibility.id, action.payload)
      };
      return {
        ...state,
        eligibility: eligibilityF
      };
    // eligibility check
    case getType(checkBonusEligibility.request):
      const eligibilityC = {
        ...state.eligibility,
        check: pot.toLoading(state.eligibility.check)
      };
      return {
        ...state,
        eligibility: eligibilityC
      };
    case getType(checkBonusEligibility.success):
      const eligibilityCS = {
        ...state.eligibility,
        check: pot.some(action.payload)
      };
      return {
        ...state,
        eligibility: eligibilityCS
      };
    case getType(checkBonusEligibility.failure):
      const eligibilityCF = {
        ...state.eligibility,
        check: pot.toError(state.eligibility.check, action.payload)
      };
      return {
        ...state,
        eligibility: eligibilityCF
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
): Option<EligibilityCheck> => pot.toOption(state.bonus.eligibility.check);

// return true either if start or check is loading
export const isEligibilityCheckLoading = (state: GlobalState): boolean =>
  pot.isLoading(state.bonus.eligibility.check) ||
  pot.isLoading(state.bonus.eligibility.id);

export default reducer;
