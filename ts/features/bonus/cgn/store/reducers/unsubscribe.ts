import { getType } from "typesafe-actions";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../common/model/RemoteValue";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { cgnUnsubscribe } from "../actions/unsubscribe";
import { GlobalState } from "../../../../../store/reducers/types";
import { cgnDetails } from "../actions/details";
import { cgnActivationComplete } from "../actions/activation";

export type CgnUnsubscribeState = RemoteValue<true, NetworkError>;
/**
 * Keep the state of "unsubscribe" from bonus outcome
 * @param state
 * @param action
 */
const reducer = (
  state: CgnUnsubscribeState = remoteUndefined,
  action: Action
): RemoteValue<true, NetworkError> => {
  switch (action.type) {
    case getType(cgnUnsubscribe.request):
      return remoteLoading;
    case getType(cgnUnsubscribe.success):
      return remoteReady(true);
    case getType(cgnUnsubscribe.failure):
      return remoteError(action.payload);
    case getType(cgnDetails.request):
    case getType(cgnActivationComplete):
      return remoteUndefined;
  }
  return state;
};

export default reducer;

export const cgnUnsubscribeSelector = (
  state: GlobalState
): CgnUnsubscribeState => state.bonus.cgn.unsubscribe;
