import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { EligibilityCheck } from "../../../../../../definitions/bonus_vacanze/EligibilityCheck";
import { EligibilityCheckSuccessEligible } from "../../../../../../definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import { InstanceId } from "../../../../../../definitions/bonus_vacanze/InstanceId";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  checkBonusVacanzeEligibility,
  storeEligibilityRequestId
} from "../actions/bonusVacanze";

export enum EligibilityRequestProgressEnum {
  "UNDEFINED" = "UNDEFINED",
  "PROGRESS" = "PROGRESS", // The request is started
  "ELIGIBLE" = "ELIGIBLE", // possible outcome
  "INELIGIBLE" = "INELIGIBLE", // possible outcome
  "ISEE_NOT_FOUND" = "ISEE_NOT_FOUND", // possible outcome
  "TIMEOUT" = "TIMEOUT", // too long to complete the request
  "ERROR" = "ERROR", // generic error / network error
  "BONUS_ACTIVATION_PENDING" = "BONUS_ACTIVATION_PENDING", // there's already an activation bonus running
  "CONFLICT" = "CONFLICT", // eligibility check succeeded but there's already a bonus found for this set of family members.
  "UNDERAGE" = "UNDERAGE" // only citizens of legal age can apply
}

export type EligibilityCheckRequest = {
  status: EligibilityRequestProgressEnum;
  check: pot.Pot<EligibilityCheck, Error>;
};

export type EligibilityState = Readonly<{
  checkRequest: EligibilityCheckRequest;
  request?: InstanceId; // the id related to the check (we could have only this if the check isn't ready and still in progress)
}>;

const INITIAL_STATE: EligibilityState = {
  checkRequest: {
    status: EligibilityRequestProgressEnum.UNDEFINED,
    check: pot.none
  }
};

const reducer = (
  state: EligibilityState = INITIAL_STATE,
  action: Action
): EligibilityState => {
  switch (action.type) {
    // eligibility
    case getType(storeEligibilityRequestId):
      return {
        ...state,
        request: action.payload
      };
    case getType(checkBonusVacanzeEligibility.request):
      return {
        ...state,
        checkRequest: {
          status: EligibilityRequestProgressEnum.PROGRESS,
          check: pot.toLoading(state.checkRequest.check)
        }
      };
    case getType(checkBonusVacanzeEligibility.success):
      return {
        ...state,
        checkRequest: {
          ...action.payload,
          check: action.payload.check
            ? pot.some(action.payload.check)
            : pot.none
        }
      };
    case getType(checkBonusVacanzeEligibility.failure):
      return {
        ...state,
        checkRequest: {
          status: EligibilityRequestProgressEnum.ERROR,
          check: pot.toError(state.checkRequest.check, action.payload)
        }
      };
  }
  return state;
};

// Selectors

export const eligibilitySelector = (state: GlobalState): EligibilityState =>
  state.bonus.bonusVacanze.eligibility;

// return some if the eligibility check is eligibile
export const eligibilityEligibleSelector = createSelector<
  GlobalState,
  EligibilityState,
  Option<EligibilityCheckSuccessEligible>
>(eligibilitySelector, eligibility =>
  pot.getOrElse(
    pot.map(eligibility.checkRequest.check, c =>
      EligibilityCheckSuccessEligible.is(c) ? some(c) : none
    ),
    none
  )
);

export const eligibilityIsLoading = createSelector<
  GlobalState,
  EligibilityState,
  boolean
>(
  eligibilitySelector,
  eligibility =>
    eligibility.checkRequest.status !== EligibilityRequestProgressEnum.ERROR
);

export default reducer;
