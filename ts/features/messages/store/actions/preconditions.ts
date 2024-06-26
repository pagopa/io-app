import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { UIMessageId, WithUIMessageId } from "../../types";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";

// NPS stands for Next Precondition Status
export type NPSScheduled = {
  nextStatus: "scheduled";
  messageId: UIMessageId;
  categoryTag: string;
};
export type NPSUpdateRequired = {
  nextStatus: "updateRequired";
};
export type NPSRetrievingData = {
  nextStatus: "retrievingData";
};
export type NPSIdle = {
  nextStatus: "idle";
};
export type NPSLoadingContent = {
  nextStatus: "loadingContent";
  messageId: UIMessageId;
  categoryTag: string;
  content: ThirdPartyMessagePrecondition;
};
export type NPSError = {
  nextStatus: "error";
  messageId: UIMessageId;
  categoryTag: string;
  reason: string;
};
export type NPSShown = {
  nextStatus: "shown";
  messageId: UIMessageId;
  categoryTag: string;
  content: ThirdPartyMessagePrecondition;
};

export const toErrorPayload = (
  messageId: UIMessageId,
  categoryTag: string,
  reason: string
): NPSError => ({
  nextStatus: "error",
  messageId,
  categoryTag,
  reason
});
export const toIdlePayload = (): NPSIdle => ({
  nextStatus: "idle"
});
export const toLoadingContentPayload = (
  messageId: UIMessageId,
  categoryTag: string,
  content: ThirdPartyMessagePrecondition
): NPSLoadingContent => ({
  nextStatus: "loadingContent",
  messageId,
  categoryTag,
  content
});
export const toRetrievingDataPayload = (): NPSRetrievingData => ({
  nextStatus: "retrievingData"
});
export const toScheduledPayload = (
  messageId: UIMessageId,
  categoryTag: string
): NPSScheduled => ({
  nextStatus: "scheduled",
  messageId,
  categoryTag
});
export const toShownPayload = (
  messageId: UIMessageId,
  categoryTag: string,
  content: ThirdPartyMessagePrecondition
): NPSShown => ({
  nextStatus: "shown",
  messageId,
  categoryTag,
  content
});
export const toUpdateRequiredPayload = (): NPSUpdateRequired => ({
  nextStatus: "updateRequired"
});

export type NextPreconditionStatus =
  | NPSScheduled
  | NPSUpdateRequired
  | NPSRetrievingData
  | NPSIdle
  | NPSLoadingContent
  | NPSError
  | NPSShown;

export const toNextMessagePreconditionStatus = createStandardAction(
  "TO_NEXT_MESSAGE_PRECONDITION_STATUS"
)<NextPreconditionStatus>();

export const getMessagePrecondition = createAsyncAction(
  "GET_MESSAGE_PRECONDITION_REQUEST",
  "GET_MESSAGE_PRECONDITION_SUCCESS",
  "GET_MESSAGE_PRECONDITION_FAILURE"
)<
  WithUIMessageId<{ categoryTag: MessageCategory["tag"] }>,
  ThirdPartyMessagePrecondition,
  Error
>();

export const clearMessagePrecondition = createStandardAction(
  "CLEAR_MESSAGE_PRECONDITION"
)<void>();
