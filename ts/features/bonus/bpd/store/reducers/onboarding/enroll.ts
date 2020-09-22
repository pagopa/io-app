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
import { CitizenResource } from "../../../../../../../definitions/bdp/citizen/CitizenResource";

// TODO: create RemoteValueReducer to avoid this code duplication
const bpdEnrollReducer = (
  state: RemoteValue<CitizenResource, Error> = remoteUndefined,
  action: Action
): RemoteValue<CitizenResource, Error> => {
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
