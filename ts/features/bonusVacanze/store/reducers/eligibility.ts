import { fromNullable, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { EligibilityCheck, EligibilityId } from "../../types/eligibility";
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
  requestProgess?: EligibilityRequestProgressEnum; // represent an internal status of the request (cause the app could do polling)
  request?: EligibilityId; // the id related to the check (we could have only this if the check isn't ready and still in progress)
}>;

const INITIAL_STATE: EligibilityState = {
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

// if is some the eligibility result is available
export const eligibilityCheck = (
  state: GlobalState
): Option<EligibilityCheck> => pot.toOption(state.bonus.eligibility.check);

export const eligibilityCheckRequestProgress = (
  state: GlobalState
): Option<EligibilityRequestProgressEnum> =>
  fromNullable(state.bonus.eligibility.requestProgess);

export default reducer;
