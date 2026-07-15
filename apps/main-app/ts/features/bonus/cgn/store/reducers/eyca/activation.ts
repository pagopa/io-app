import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import {
  getValueOrElse,
  isLoading,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../../common/model/RemoteValue";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import {
  cgnEycaActivation,
  cgnEycaActivationStatusRequest
} from "../../actions/eyca/activation";

export type CgnEycaActivationStatus =
  | "ALREADY_ACTIVE"
  | "COMPLETED"
  | "ERROR"
  | "INELIGIBLE"
  | "NOT_FOUND"
  | "POLLING"
  | "POLLING_TIMEOUT"
  | "PROCESSING";

export type EycaActivationState = RemoteValue<
  CgnEycaActivationStatus,
  NetworkError
>;

const INITIAL_STATE: EycaActivationState = remoteUndefined;

const reducer = (
  state: EycaActivationState = INITIAL_STATE,
  action: Action
): EycaActivationState => {
  switch (action.type) {
    case getType(cgnEycaActivation.failure):
      return remoteError(action.payload);
    // bonus activation
    case getType(cgnEycaActivation.request):
    case getType(cgnEycaActivationStatusRequest):
      return remoteLoading;
    case getType(cgnEycaActivation.success):
      return remoteReady(action.payload);
  }
  return state;
};

// Selectors
export const eycaActivationStatusSelector = (
  state: GlobalState
): EycaActivationState => state.bonus.cgn.eyca.activation;

// return the cgn eyca status
export const cgnEycaActivationStatus = createSelector(
  eycaActivationStatusSelector,
  (activation: EycaActivationState): CgnEycaActivationStatus | undefined =>
    getValueOrElse(activation, undefined)
);

export const cgnEycaActivationLoading = createSelector(
  eycaActivationStatusSelector,
  (activation: EycaActivationState): boolean => isLoading(activation)
);

export default reducer;
