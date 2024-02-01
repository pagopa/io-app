// bonus reducer
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { CgnActivationDetail } from "../../../../../../definitions/cgn/CgnActivationDetail";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  cgnActivationStatus,
  cgnRequestActivation
} from "../actions/activation";
import { CgnActivationProgressEnum } from "../actions/utils";

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
    // bonus activation
    case getType(cgnRequestActivation):
    case getType(cgnActivationStatus.request):
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
    case getType(cgnActivationStatus.failure):
      return {
        ...state,
        status: CgnActivationProgressEnum.ERROR
      };
  }
  return state;
};

// Selectors
export const activationSelector = (state: GlobalState): ActivationState =>
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
