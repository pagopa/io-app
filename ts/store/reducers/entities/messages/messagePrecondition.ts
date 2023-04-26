import { getType } from "typesafe-actions";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import {
  getMessagePrecondition,
  clearMessagePrecondition
} from "../../../actions/messages";
import {
  RemoteValue,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../features/bonus/bpd/model/RemoteValue";
import { UIMessageId } from "./types";

export type MessagePrecondition = {
  messageId: UIMessageId | undefined;
  content: RemoteValue<ThirdPartyMessagePrecondition, Error>;
};

const INITIAL_STATE: MessagePrecondition = {
  messageId: undefined,
  content: remoteUndefined
};

export const messagePreconditionReducer = (
  state: MessagePrecondition = INITIAL_STATE,
  action: Action
): MessagePrecondition => {
  switch (action.type) {
    case getType(getMessagePrecondition.request):
      return {
        messageId: action.payload,
        content: remoteLoading
      };
    case getType(getMessagePrecondition.success):
      return {
        ...state,
        content: remoteReady(action.payload)
      };
    case getType(getMessagePrecondition.failure):
      return {
        ...state,
        content: remoteError(action.payload)
      };
    case getType(clearMessagePrecondition):
      return INITIAL_STATE;
  }
  return state;
};

export const messagePreconditionSelector = (state: GlobalState) =>
  state.entities.messages.messagePrecondition;
