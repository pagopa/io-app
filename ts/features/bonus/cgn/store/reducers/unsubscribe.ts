import { getType } from "typesafe-actions";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bpd/model/RemoteValue";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { cgnUnsubscribe } from "../actions/unsubscribe";
import { GlobalState } from "../../../../../store/reducers/types";

export type CgnUnsubscribeState = RemoteValue<true, NetworkError>;
/**
 * Keep the state of "unsubscribe" from bpd outcome
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
  }
  return state;
};

export default reducer;

export const cgnUnsubscribeSelector = (
  state: GlobalState
): CgnUnsubscribeState => state.bonus.cgn.unsubscribe;
