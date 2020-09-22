import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { enrollToBpd } from "../../actions/onboarding";

// TODO: create RemoteValueReducer to avoid this code duplication
const bpdEnrollReducer = (
  state: RemoteValue<boolean, Error> = remoteUndefined,
  action: Action
): RemoteValue<boolean, Error> => {
  switch (action.type) {
    case getType(enrollToBpd.request):
      return remoteLoading;
    case getType(enrollToBpd.success):
      return remoteReady(action.payload);
    case getType(enrollToBpd.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default bpdEnrollReducer;
