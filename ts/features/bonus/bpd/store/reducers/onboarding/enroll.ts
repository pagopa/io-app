import { getType } from "typesafe-actions";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { enrollToBpd } from "../../actions/onboarding";
import { Action } from "../../../../../../store/actions/types";

/**
 * This reducers use the action {@link enrollToBpd} to save&update the result of the enrollment operation
 * @param state
 * @param action
 */
const bpdEnrollUserReducer = (
  state: RemoteValue<boolean, Error> = remoteUndefined,
  action: Action
): RemoteValue<boolean, Error> => {
  switch (action.type) {
    case getType(enrollToBpd.request):
      return remoteLoading;
    case getType(enrollToBpd.success):
      return remoteReady(action.payload.enabled);
    case getType(enrollToBpd.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default bpdEnrollUserReducer;
