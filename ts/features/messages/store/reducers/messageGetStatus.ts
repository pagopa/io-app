import { getType } from "typesafe-actions";
import {
  SuccessGetMessageDataActionType,
  getMessageDataAction,
  reloadAllMessages,
  resetGetMessageDataAction
} from "../actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { startApplicationInitialization } from "../../../../store/actions/application";

export type MessageGetStatusFailurePhaseType =
  | "none"
  | "paginatedMessage"
  | "serviceDetails"
  | "messageDetails"
  | "preconditions"
  | "thirdPartyMessageDetails"
  | "readStatusUpdate";

type IdleState = {
  status: "idle";
};

type BlockedOrErrorState = {
  status: "blocked" | "error";
  failurePhase: MessageGetStatusFailurePhaseType;
};

type LoadingOrRetryState = {
  status: "loading" | "retry";
  data: {
    messageId: string;
    fromPushNotification: boolean;
  };
};

type SuccessState = {
  status: "success";
  successData: SuccessGetMessageDataActionType;
};

export type MessageGetStatus =
  | IdleState
  | BlockedOrErrorState
  | LoadingOrRetryState
  | SuccessState;

export const INITIAL_STATE: MessageGetStatus = {
  status: "idle"
};

export const messageGetStatusReducer = (
  state: MessageGetStatus = INITIAL_STATE,
  action: Action
): MessageGetStatus => {
  switch (action.type) {
    case getType(getMessageDataAction.request):
      return {
        status: "loading",
        data: {
          messageId: action.payload.messageId,
          fromPushNotification: action.payload.fromPushNotification
        }
      };
    case getType(startApplicationInitialization):
      const fastLoginSessionExpired =
        !!(action.payload && action.payload.handleSessionExpiration) &&
        isLoadingStatus(state);
      return fastLoginSessionExpired
        ? {
            ...state,
            status: "retry"
          }
        : state;
    case getType(getMessageDataAction.failure):
      return {
        status: action.payload.blockedFromPushNotificationOpt
          ? "blocked"
          : "error",
        failurePhase: action.payload.phase
      };
    case getType(getMessageDataAction.success):
      return {
        status: "success",
        successData: action.payload
      };
    case getType(resetGetMessageDataAction):
    case getType(reloadAllMessages.request):
      return INITIAL_STATE;
  }
  return state;
};

const isLoadingStatus = (
  messageGetStatus: MessageGetStatus
): messageGetStatus is LoadingOrRetryState =>
  messageGetStatus.status === "loading";
const isRetryStatus = (
  messageGetStatus: MessageGetStatus
): messageGetStatus is LoadingOrRetryState =>
  messageGetStatus.status === "retry";
const isSuccessStatus = (
  messageGetStatus: MessageGetStatus
): messageGetStatus is SuccessState => messageGetStatus.status === "success";

export const showSpinnerFromMessageGetStatusSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.status !== "error";

export const thirdPartyMessageDetailsErrorSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.status === "error" &&
  state.entities.messages.messageGetStatus.failurePhase ===
    "thirdPartyMessageDetails";

export const messageSuccessDataSelector = (state: GlobalState) =>
  isSuccessStatus(state.entities.messages.messageGetStatus)
    ? state.entities.messages.messageGetStatus.successData
    : undefined;

export const blockedFromPushNotificationSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.status === "blocked";

export const retryDataAfterFastLoginSessionExpirationSelector = (
  state: GlobalState
) =>
  isRetryStatus(state.entities.messages.messageGetStatus)
    ? state.entities.messages.messageGetStatus.data
    : undefined;
