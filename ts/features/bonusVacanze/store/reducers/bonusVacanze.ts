import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { BonusList } from "../../types/bonusList";
import {
  EligibilityCheck,
  EligibilityCheckStatusEnum,
  EligibilityId
} from "../../types/eligibility";
import {
  availableBonusesLoad,
  checkBonusEligibility,
  eligibilityRequestId,
  eligibilityRequestProgress
} from "../actions/bonusVacanze";

// type alias
type BonusVacanzeState = pot.Pot<BonusVacanze, Error>;

export type BonusState = Readonly<{
  availableBonuses: AvailableBonusesState;
  eligibility: EligibilityState;
  bonusVacanze: BonusVacanzeState;
}>;

// bonus reducer
const bonusReducer = (
  state: BonusVacanzeState = pot.none,
  action: Action
): BonusVacanzeState => {
  switch (action.type) {
    // available bonuses
    case getType(loadBonusVacanzeFromId.request):
      return pot.toLoading(state);
    case getType(loadBonusVacanzeFromId.success):
      return pot.some(action.payload);
    case getType(loadBonusVacanzeFromId.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

const reducer = combineReducers<BonusState, Action>({
  availableBonuses: availableBonusesReducer,
  eligibility: eligibilityReducer,
  bonusVacanze: bonusReducer
});

// Selector
// Selectors
export const bonusVacanzeSelector = (
  state: GlobalState
): pot.Pot<BonusVacanze, Error> => state.bonus.bonusVacanze;

// if is some the eligibility result is available
export const eligibilityCheck = (
  state: GlobalState
): Option<EligibilityCheck> => pot.toOption(state.bonus.eligibility.check);

export const eligibilityCheckRequestProgress = (
  state: GlobalState
): Option<EligibilityRequestProgressEnum> =>
  fromNullable(state.bonus.eligibility.requestProgess);

export enum EligibilityOutcome {
  "LOADING" = "LOADING",
  "ELIGIBLE" = "ELIGIBLE",
  "INELIGIBLE" = "INELIGIBLE",
  "ISEE_NOT_FOUND" = "ISEE_NOT_FOUND",
  "ASYNC_ELIGIBILITY" = "ASYNC_ELIGIBILITY"
}

const fromEligibilityCheckStatusEnumtoEligibilityOutcome = new Map([
  [EligibilityCheckStatusEnum.ELIGIBLE, EligibilityOutcome.ELIGIBLE],
  [EligibilityCheckStatusEnum.INELIGIBLE, EligibilityOutcome.INELIGIBLE],
  [EligibilityCheckStatusEnum.ISEE_NOT_FOUND, EligibilityOutcome.ISEE_NOT_FOUND]
]);

export const calculateEligibility = (
  value: Option<EligibilityCheck>
): Option<EligibilityOutcome> => {
  return value.map(val =>
    fromNullable(
      fromEligibilityCheckStatusEnumtoEligibilityOutcome.get(val.status)
    ).getOrElse(EligibilityOutcome.LOADING)
  );
};

export const eligibilityOutcome = createSelector(
  eligibilityCheckRequestProgress,
  eligibilityCheck,
  (progress, value) => {
    const pollingExceeded = progress
      .filter(
        eligibilityProgress =>
          eligibilityProgress ===
          EligibilityRequestProgressEnum.POLLING_EXCEEDED
      )
      .map(_ => EligibilityOutcome.ASYNC_ELIGIBILITY);

    return pollingExceeded
      .orElse(() =>
        progress
          .filter(
            eligibilityProgress =>
              eligibilityProgress === EligibilityRequestProgressEnum.COMPLETE
          )
          .chain(_ => calculateEligibility(value))
      )
      .getOrElse(EligibilityOutcome.LOADING);
  }
);

export default reducer;
