import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { startApplicationInitialization } from "../../../../store/actions/application";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  cancelGetMessageDataAction,
  getMessageDataAction,
  RequestGetMessageDataActionType,
  resetGetMessageDataAction,
  SuccessGetMessageDataActionType
} from "../actions";
import { getPaginatedMessageById } from "./paginatedById";

export type MessageGetStatus =
  | BlockedOrErrorState
  | IdleState
  | LoadingOrRetryState
  | SuccessState;

export type MessageGetStatusFailurePhaseType =
  | "messageDetails"
  | "none"
  | "paginatedMessage"
  | "preconditions"
  | "readStatusUpdate"
  | "serviceDetails"
  | "thirdPartyMessageDetails";

type BlockedOrErrorState = {
  failurePhase: MessageGetStatusFailurePhaseType;
  status: "blocked" | "error";
};

type IdleState = {
  status: "idle";
};

type LoadingOrRetryState = {
  data: RequestGetMessageDataActionType;
  status: "loading" | "retry";
};

type SuccessState = {
  status: "success";
  successData: SuccessGetMessageDataActionType;
};

export const INITIAL_STATE: MessageGetStatus = {
  status: "idle"
};

export const messageGetStatusReducer = (
  state: MessageGetStatus = INITIAL_STATE,
  action: Action
): MessageGetStatus => {
  switch (action.type) {
    case getType(cancelGetMessageDataAction):
    case getType(resetGetMessageDataAction):
      return INITIAL_STATE;
    case getType(getMessageDataAction.failure):
      return {
        status: action.payload.blockedFromPushNotificationOpt
          ? "blocked"
          : "error",
        failurePhase: action.payload.phase
      };
    case getType(getMessageDataAction.request):
      return {
        status: "loading",
        data: {
          messageId: action.payload.messageId,
          fromPushNotification: action.payload.fromPushNotification
        }
      };
    case getType(getMessageDataAction.success):
      return {
        status: "success",
        successData: action.payload
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

export const messageGetStatusSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus;

/** Includes a load waiting to be retried after a session refresh. */
export const isLoadingMessageDataSelector = (
  state: GlobalState,
  messageId: string
) => {
  const messageGetStatus = state.entities.messages.messageGetStatus;
  return (
    (isLoadingStatus(messageGetStatus) || isRetryStatus(messageGetStatus)) &&
    messageGetStatus.data.messageId === messageId
  );
};

export const loadedMessageDataSelector = (
  state: GlobalState,
  messageId: string
) => {
  const messageGetStatus = state.entities.messages.messageGetStatus;
  return messageGetStatus.status === "success" &&
    messageGetStatus.successData.messageId === messageId
    ? messageGetStatus.successData
    : undefined;
};

export const messageGetStatusErrorPhaseSelector = (state: GlobalState) =>
  state.entities.messages.messageGetStatus.status === "error"
    ? state.entities.messages.messageGetStatus.failurePhase
    : undefined;

export const retryDataAfterFastLoginSessionExpirationSelector = (
  state: GlobalState
) =>
  isRetryStatus(state.entities.messages.messageGetStatus)
    ? state.entities.messages.messageGetStatus.data
    : undefined;

export type MessageRouterScreenErrorVariant =
  | "genericError"
  | "messageNotFound"
  | "thirdPartyError";
export const messageRouterScreenErrorVariantSelector = (
  state: GlobalState,
  messageId: string
): MessageRouterScreenErrorVariant => {
  const messageGetErrorPhase = messageGetStatusErrorPhaseSelector(state);
  const messagePot = getPaginatedMessageById(state, messageId);
  const paginatedErrorKind = pot.isError(messagePot)
    ? messagePot.error.kind
    : undefined;
  if (
    messageGetErrorPhase === "paginatedMessage" &&
    paginatedErrorKind === "messageNotFound"
  ) {
    return "messageNotFound";
  }
  if (messageGetErrorPhase === "thirdPartyMessageDetails") {
    return "thirdPartyError";
  }
  return "genericError";
};
