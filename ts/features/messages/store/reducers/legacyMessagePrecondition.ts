import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import {
  clearMessagePrecondition,
  getMessagePrecondition
} from "../actions/preconditions";
import {
  RemoteValue,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../common/model/RemoteValue";
import { UIMessageId } from "../../types";

export type LegacyMessagePrecondition = {
  messageId: O.Option<UIMessageId>;
  content: RemoteValue<ThirdPartyMessagePrecondition, Error>;
};

const INITIAL_STATE: LegacyMessagePrecondition = {
  messageId: O.none,
  content: remoteUndefined
};

export const legacyMessagePreconditionReducer = (
  state: LegacyMessagePrecondition = INITIAL_STATE,
  action: Action
): LegacyMessagePrecondition => {
  switch (action.type) {
    case getType(getMessagePrecondition.request):
      return {
        messageId: O.some(action.payload.id),
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

export const legacyMessagePreconditionSelector = (state: GlobalState) =>
  state.entities.messages.legacyMessagePrecondition;
