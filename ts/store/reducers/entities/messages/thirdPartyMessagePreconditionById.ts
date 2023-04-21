import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import {
  loadThirdPartyMessagePrecondition,
  clearThirdPartyMessagePrecondition
} from "../../../actions/messages";
import {
  RemoteValue,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../features/bonus/bpd/model/RemoteValue";
import { UIMessageId } from "./types";

export type ThirdPartyMessagePreconditionById = {
  messageId: UIMessageId | undefined;
  content: RemoteValue<ThirdPartyMessagePrecondition, Error>;
};

const INITIAL_STATE: ThirdPartyMessagePreconditionById = {
  messageId: undefined,
  content: remoteUndefined
};

export const thirdPartyMessagePreconditionByIdReducer = (
  state: ThirdPartyMessagePreconditionById = INITIAL_STATE,
  action: Action
): ThirdPartyMessagePreconditionById => {
  switch (action.type) {
    case getType(loadThirdPartyMessagePrecondition.request):
      return {
        messageId: action.payload,
        content: remoteLoading
      };
    case getType(loadThirdPartyMessagePrecondition.success):
      return {
        ...state,
        content: remoteReady(action.payload)
      };
    case getType(loadThirdPartyMessagePrecondition.failure):
      return {
        ...state,
        content: remoteError(action.payload)
      };
    case getType(clearThirdPartyMessagePrecondition):
      return INITIAL_STATE;
  }
  return state;
};

export const thirdPartyMessagePreconditionByIdSelector = createSelector(
  [
    (state: GlobalState) =>
      state.entities.messages.thirdPartyMessagePreconditionById
  ],
  (_: ThirdPartyMessagePreconditionById): ThirdPartyMessagePreconditionById => _
);
