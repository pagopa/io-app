// bonus reducer
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { activateBonusVacanze } from "../actions/bonusVacanze";

export enum BonusActivationProgressEnum {
  "ELIGIBILITY_EXPIRED" = "ELIGIBILITY_EXPIRED", // Cannot activate a new bonus because the eligibility data has expired.
  "UNDEFINED" = "UNDEFINED",
  "PROGRESS" = "PROGRESS", // The request is started
  "TIMEOUT" = "TIMEOUT", // Polling time exceeded
  "ERROR" = "ERROR", // The request is started
  "EXISTS" = "EXISTS", // Another bonus related to this user was found
  "SUCCESS" = "SUCCESS" // Activation has been completed
}

export type ActivationState = {
  status: BonusActivationProgressEnum;
};

const INITIAL_STATE: ActivationState = {
  status: BonusActivationProgressEnum.UNDEFINED
};
const reducer = (
  state: ActivationState = INITIAL_STATE,
  action: Action
): ActivationState => {
  switch (action.type) {
    // bonus activation
    case getType(activateBonusVacanze.request):
      return {
        ...state,
        status: BonusActivationProgressEnum.PROGRESS
      };
    case getType(activateBonusVacanze.success):
      return {
        ...state,
        status: action.payload.status
      };
    case getType(activateBonusVacanze.failure):
      return {
        ...state,
        status: BonusActivationProgressEnum.ERROR
      };
  }
  return state;
};

export const activationIsLoading = (state: GlobalState): boolean =>
  state.bonus.bonusVacanze.activation.status !==
  BonusActivationProgressEnum.ERROR;

export default reducer;
