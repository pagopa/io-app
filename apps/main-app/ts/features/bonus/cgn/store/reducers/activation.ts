import { createSelector } from "reselect";
// bonus reducer
import { getType } from "typesafe-actions";

import { CgnActivationDetail } from "../../../../../../definitions/cgn/CgnActivationDetail";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  cgnActivationStatus,
  cgnRequestActivation
} from "../actions/activation";

export enum CgnActivationProgressEnum {
  "ERROR" = "ERROR", // There's an error
  "EXISTS" = "EXISTS", // Another bonus related to this user was found
  "INELIGIBLE" = "INELIGIBLE", // Another bonus related to this user was found
  "PENDING" = "PENDING", // Polling time exceeded
  "PROGRESS" = "PROGRESS", // The request is started
  "SUCCESS" = "SUCCESS", // Activation has been completed
  "TIMEOUT" = "TIMEOUT", // number of polling exceeded
  "UNDEFINED" = "UNDEFINED"
}

export type ActivationState = {
  status: CgnActivationProgressEnum;
  value?: CgnActivationDetail;
};

const INITIAL_STATE: ActivationState = {
  status: CgnActivationProgressEnum.UNDEFINED
};

const reducer = (
  state: ActivationState = INITIAL_STATE,
  action: Action
): ActivationState => {
  switch (action.type) {
    case getType(cgnActivationStatus.failure):
      return {
        ...state,
        status: CgnActivationProgressEnum.ERROR
      };
    // bonus activation
    case getType(cgnActivationStatus.request):
    case getType(cgnRequestActivation):
      return {
        ...state,
        status: CgnActivationProgressEnum.PROGRESS
      };
    case getType(cgnActivationStatus.success):
      return {
        ...state,
        status: action.payload.status,
        value: action.payload.activation
      };
  }
  return state;
};

// Selectors
const activationSelector = (state: GlobalState): ActivationState =>
  state.bonus.cgn.activation;

export const isCgnActivationLoading = createSelector<
  GlobalState,
  ActivationState,
  boolean
>(
  activationSelector,
  activation => activation.status !== CgnActivationProgressEnum.ERROR
);

export default reducer;
