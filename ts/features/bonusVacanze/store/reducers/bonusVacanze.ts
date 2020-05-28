import { fromNullable, Option } from "fp-ts/lib/Option";
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

export enum EligibilityRequestProgressEnum {
  "PENDING" = "PENDING", // running
  "ERROR" = "ERROR", // generic error / network error
  "POLLING_STARTED" = "POLLING_STARTED",
  "POLLING_EXCEEDED" = "POLLING_EXCEEDED", // stop polling when threshold is exceeded
  "POLLING_ABORTED" = "POLLING_ABORTED", // canceled by the user
  "COMPLETE" = "COMPLETE" // we got the isee result
}

export type BonusState = Readonly<{
  availableBonuses: pot.Pot<BonusList, Error>;
  eligibility: {
    check: pot.Pot<EligibilityCheck, Error>; // the result of ISEE check
    requestProgess?: EligibilityRequestProgressEnum; // represent an internal status of the request (cause the app could do polling)
    request?: EligibilityId; // the id related to the check (we could have only this if the check isn't ready and still in progress)
  };
}>;

const INITIAL_STATE: BonusState = {
  availableBonuses: pot.none,
  eligibility: { check: pot.none }
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
    // eligibility
    case getType(eligibilityRequestId):
      return {
        ...state,
        eligibility: {
          ...state.eligibility,
          request: action.payload
        }
      };
    case getType(eligibilityRequestProgress):
      return {
        ...state,
        eligibility: {
          ...state.eligibility,
          requestProgess: action.payload
        }
      };
    case getType(checkBonusEligibility.request):
      return {
        ...state,
        eligibility: {
          ...state.eligibility,
          check: pot.toLoading(state.eligibility.check)
        }
      };
    case getType(checkBonusEligibility.success):
      return {
        ...state,
        eligibility: {
          ...state.eligibility,
          check: pot.some(action.payload)
        }
      };
    case getType(checkBonusEligibility.failure):
      return {
        ...state,
        eligibility: {
          ...state.eligibility,
          check: pot.toError(state.eligibility.check, action.payload)
        }
      };
  }
  return state;
};

// Selectors
export const availableBonuses = (
  state: GlobalState
): pot.Pot<BonusList, Error> => state.bonus.availableBonuses;

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
