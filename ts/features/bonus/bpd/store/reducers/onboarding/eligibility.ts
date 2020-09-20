import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  RemoteValue
} from "../../../model/RemoteValue";
import { checkBdpEligibility } from "../../actions/onboarding";

// TODO: create RemoteValueReducer to avoid this code duplication
const bpdEligibilityReducer = (
  state: RemoteValue<boolean, Error> = { kind: "undefined" },
  action: Action
): RemoteValue<boolean, Error> => {
  switch (action.type) {
    case getType(checkBdpEligibility.request):
      return remoteLoading;
    case getType(checkBdpEligibility.success):
      return remoteReady(action.payload);
    case getType(checkBdpEligibility.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default bpdEligibilityReducer;
