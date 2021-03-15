import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { NetworkError } from "../../../../../../utils/errors";
import { cgnEycaActivation } from "../../actions/eyca/activation";

export type CgnEycaActivationStatus =
  | "UNDEFINED"
  | "NOT_FOUND"
  | "PROCESSING"
  | "COMPLETED"
  | "INELIGIBLE"
  | "ALREADY_ACTIVE"
  | "POLLING_TIMEOUT"
  | "ERROR";

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
    // bonus activation
    case getType(cgnEycaActivation.request):
      return remoteLoading;
    case getType(cgnEycaActivation.success):
      return remoteReady(action.payload);
    case getType(cgnEycaActivation.failure):
      return remoteError(action.payload);
  }
  return state;
};

// Selectors
export const eycaActivationStatusSelector = (
  state: GlobalState
): EycaActivationState => state.bonus.cgn.eyca.activation;

export default reducer;
