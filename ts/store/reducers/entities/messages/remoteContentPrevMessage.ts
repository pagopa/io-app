import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { RemoteContentPrev } from "../../../../../definitions/backend/RemoteContentPrev";
import {
  remoteContentPrevMessage,
  clearRemoteContentPrevMessage
} from "../../../actions/messages";
import {
  RemoteValue,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../features/bonus/bpd/model/RemoteValue";
import { UIMessage } from "./types";

export type RemoteContentPrevMessage = {
  message: UIMessage | undefined;
  content: RemoteValue<RemoteContentPrev, Error>;
};

const INITIAL_STATE: RemoteContentPrevMessage = {
  message: undefined,
  content: remoteUndefined
};

export const remoteContentPrevMessageReducer = (
  state: RemoteContentPrevMessage = INITIAL_STATE,
  action: Action
): RemoteContentPrevMessage => {
  switch (action.type) {
    case getType(remoteContentPrevMessage.request):
      return {
        message: action.payload,
        content: remoteLoading
      };
    case getType(remoteContentPrevMessage.success):
      return {
        ...state,
        content: remoteReady(action.payload)
      };
    case getType(remoteContentPrevMessage.failure):
      return {
        ...state,
        content: remoteError(action.payload)
      };
    case getType(clearRemoteContentPrevMessage):
      return INITIAL_STATE;
  }
  return state;
};

export const remoteContentPrevMessageSelector = createSelector(
  [(state: GlobalState) => state.entities.messages.remoteContentPrevMessage],
  (_: RemoteContentPrevMessage): RemoteContentPrevMessage => _
);
