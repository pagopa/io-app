// bonus reducer
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  cgnEycaActivationRequest,
  cgnEycaActivationStatus
} from "../../actions/eyca/activation";
import { EycaActivationDetail } from "../../../../../../../definitions/cgn/EycaActivationDetail";

export enum CgnEycaActivationProgressEnum {
  "UNDEFINED" = "UNDEFINED",
  "TIMEOUT" = "TIMEOUT", // number of polling exceeded
  "PROGRESS" = "PROGRESS", // The request is started
  "PENDING" = "PENDING", // Polling time exceeded
  "ERROR" = "ERROR", // There's an error
  "EXISTS" = "EXISTS", // Another bonus related to this user was found
  "INELIGIBLE" = "INELIGIBLE", // Another bonus related to this user was found
  "SUCCESS" = "SUCCESS" // Activation has been completed
}

export type EycaActivationState = {
  status: CgnEycaActivationProgressEnum;
  value?: EycaActivationDetail;
};

const INITIAL_STATE: EycaActivationState = {
  status: CgnEycaActivationProgressEnum.UNDEFINED
};

const reducer = (
  state: EycaActivationState = INITIAL_STATE,
  action: Action
): EycaActivationState => {
  switch (action.type) {
    // bonus activation
    case getType(cgnEycaActivationRequest):
    case getType(cgnEycaActivationStatus.request):
      return {
        ...state,
        status: CgnEycaActivationProgressEnum.PROGRESS
      };
    case getType(cgnEycaActivationStatus.success):
      return {
        ...state,
        status: action.payload.status,
        value: action.payload.value
      };
    case getType(cgnEycaActivationStatus.failure):
      return {
        ...state,
        status: CgnEycaActivationProgressEnum.ERROR
      };
  }
  return state;
};

// Selectors
export const eycaActivationSelector = (
  state: GlobalState
): EycaActivationState => state.bonus.cgn.eyca.activation;

export const isCgnActivationLoading = createSelector<
  GlobalState,
  EycaActivationState,
  boolean
>(
  eycaActivationSelector,
  activation => activation.status !== CgnEycaActivationProgressEnum.ERROR
);

export default reducer;
