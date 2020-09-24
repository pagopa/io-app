import { getType } from "typesafe-actions";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { bpdEnrollUserToProgram } from "../../actions/onboarding";
import { Action } from "../../../../../../store/actions/types";

/**
 * This reducers use the action {@link bpdEnrollUserToProgram} to save&update the result of the enrollment operation
 * @param state
 * @param action
 */
const bpdEnrollUserReducer = (
  state: RemoteValue<boolean, Error> = remoteUndefined,
  action: Action
): RemoteValue<boolean, Error> => {
  switch (action.type) {
    case getType(bpdEnrollUserToProgram.request):
      return remoteLoading;
    case getType(bpdEnrollUserToProgram.success):
      return remoteReady(action.payload.enabled);
    case getType(bpdEnrollUserToProgram.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default bpdEnrollUserReducer;
