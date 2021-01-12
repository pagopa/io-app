// bonus reducer
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { cgnActivationStatus } from "../actions/activation";

export enum CgnActivationProgressEnum {
  "UNDEFINED" = "UNDEFINED",
  "PROGRESS" = "PROGRESS", // The request is started
  "PENDING" = "PENDING", // Polling time exceeded
  "ERROR" = "ERROR", // The request is started
  "EXISTS" = "EXISTS", // Another bonus related to this user was found
  "SUCCESS" = "SUCCESS" // Activation has been completed
}

export type ActivationState = {
  status: CgnActivationProgressEnum;
};

const INITIAL_STATE: ActivationState = {
  status: CgnActivationProgressEnum.UNDEFINED
};
const reducer = (
  state: ActivationState = INITIAL_STATE,
  action: Action
): ActivationState => {
  switch (action.type) {
    // bonus activation
    case getType(cgnActivationStatus.request):
      return {
        ...state,
        status: CgnActivationProgressEnum.PROGRESS
      };
    case getType(cgnActivationStatus.success):
      return {
        ...state,
        status: CgnActivationProgressEnum.PROGRESS // To replace with action payload when types are defined
      };
    case getType(cgnActivationStatus.failure):
      return {
        ...state,
        status: CgnActivationProgressEnum.ERROR
      };
  }
  return state;
};

export default reducer;
