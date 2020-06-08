import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { EligibilityCheck } from "../../../../../definitions/bonus_vacanze/EligibilityCheck";
import { EligibilityCheckSuccessEligible } from "../../../../../definitions/bonus_vacanze/EligibilityCheckSuccessEligible";
import { InstanceId } from "../../../../../definitions/bonus_vacanze/InstanceId";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  checkBonusEligibility,
  eligibilityRequestId,
  eligibilityRequestProgress
} from "../actions/bonusVacanze";

export enum EligibilityRequestProgressEnum {
  "UNDEFINED" = "UNDEFINED",
  "PROGRESS" = "PROGRESS", // The request is started
  "ELIGIBLE" = "ELIGIBLE", // possible outcome
  "INELIGIBLE" = "INELIGIBLE", // possible outcome
  "ISEE_NOT_FOUND" = "ISEE_NOT_FOUND", // possible outcome
  "TIMEOUT" = "TIMEOUT", // too long to complete the request
  "ERROR" = "ERROR" // generic error / network error
}

export type EligibilityState = Readonly<{
  check: pot.Pot<EligibilityCheck, Error>; // the result of ISEE check
  requestProgess: EligibilityRequestProgressEnum; // represent an internal status of the request (cause the app could do polling)
  request?: InstanceId; // the id related to the check (we could have only this if the check isn't ready and still in progress)
}>;

const INITIAL_STATE: EligibilityState = {
  requestProgess: EligibilityRequestProgressEnum.UNDEFINED,
  check: pot.none
};

const reducer = (
  state: EligibilityState = INITIAL_STATE,
  action: Action
): EligibilityState => {
  switch (action.type) {
    // eligibility
    case getType(eligibilityRequestId):
      return {
        ...state,
        request: action.payload
      };
    case getType(eligibilityRequestProgress):
      return {
        ...state,
        requestProgess: action.payload
      };
    case getType(checkBonusEligibility.request):
      return {
        ...state,
        check: pot.toLoading(state.check)
      };
    case getType(checkBonusEligibility.success):
      return {
        ...state,
        check: pot.some(action.payload)
      };
    case getType(checkBonusEligibility.failure):
      return {
        ...state,
        check: pot.toError(state.check, action.payload)
      };
  }
  return state;
};

// Selectors

// return some if the eligibility check is eligibile
export const eligibilityEligibleSelector = (
  state: GlobalState
): Option<EligibilityCheckSuccessEligible> => {
  const check = state.bonus.eligibility.check;
  return pot.getOrElse(
    pot.map(
      check,
      c => (EligibilityCheckSuccessEligible.is(c) ? some(c) : none)
    ),
    none
  );
};

export const eligibilitySelector = (
  state: GlobalState
): Option<EligibilityCheck> => pot.toOption(state.bonus.eligibility.check);

export const eligibilityRequestProgressSelector = (
  state: GlobalState
): EligibilityRequestProgressEnum => state.bonus.eligibility.requestProgess;

export default reducer;
