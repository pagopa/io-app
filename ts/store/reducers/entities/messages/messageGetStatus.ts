import { getType } from "typesafe-actions";
import {
  SuccessGetMessageDataActionType,
  getMessageDataAction,
  resetGetMessageDataAction
} from "../../../../features/messages/actions";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { reloadAllMessages } from "../../../actions/messages";

export type MessageGetStatusType =
  | "idle"
  | "loading"
  | "blocked"
  | "error"
  | "success";
export type MessageGetStatusFailurePhaseType =
  | "none"
  | "paginatedMessage"
  | "messageDetails"
  | "preconditions"
  | "thirdPartyMessageDetails"
  | "readStatusUpdate";

export type MessageGetStatus = {
  failurePhase: MessageGetStatusFailurePhaseType;
  status: MessageGetStatusType;
  successData: SuccessGetMessageDataActionType | undefined;
};

export const INITIAL_STATE: MessageGetStatus = {
  failurePhase: "none",
  status: "idle",
  successData: undefined
};

export const messageGetStatusReducer = (
  state: MessageGetStatus = INITIAL_STATE,
  action: Action
): MessageGetStatus => {
  switch (action.type) {
    case getType(getMessageDataAction.request):
      return {
        status: "loading",
        failurePhase: "none",
        successData: undefined
      };
    case getType(getMessageDataAction.failure):
      return {
        status: action.payload.blockedFromPushNotificationOpt
          ? "blocked"
          : "error",
        failurePhase: action.payload.phase,
        successData: undefined
      };
    case getType(getMessageDataAction.success):
      return {
        status: "success",
        failurePhase: "none",
        successData: action.payload
      };
    case getType(resetGetMessageDataAction):
    case getType(reloadAllMessages.request):
      return INITIAL_STATE;
  }
  return state;
};

export const showSpinnerFromMessageGetStatusSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.status !== "error";

export const thirdPartyMessageDetailsErrorSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.status === "error" &&
  state.entities.messages.messageGetStatus.failurePhase ===
    "thirdPartyMessageDetails";

export const messageSuccessDataSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.successData;

export const blockedFromPushNotificationSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.status === "blocked";
