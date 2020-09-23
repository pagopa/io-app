import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { loadBdpActivationStatus } from "../../actions/details";
import { CitizenResource } from "../../../../../../../definitions/bpd/citizen/CitizenResource";

const bpdCitizenReducer = (
  state: RemoteValue<CitizenResource, Error> = remoteUndefined,
  action: Action
): RemoteValue<CitizenResource, Error> => {
  switch (action.type) {
    case getType(loadBdpActivationStatus.request):
      return remoteLoading;
    case getType(loadBdpActivationStatus.success):
      return remoteReady(action.payload);
    case getType(loadBdpActivationStatus.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default bpdCitizenReducer;
