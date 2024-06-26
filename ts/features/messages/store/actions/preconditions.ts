import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { UIMessageId, WithUIMessageId } from "../../types";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";

// NPS stands for Next Precondition Status
export type NPSError = {
  nextStatus: "error";
  reason: string;
};
export type NPSIdle = {
  nextStatus: "idle";
};
export type NPSLoadingContent = {
  nextStatus: "loadingContent";
  content: ThirdPartyMessagePrecondition;
};
export type NPSRetrievingData = {
  nextStatus: "retrievingData";
};
export type NPSScheduled = {
  nextStatus: "scheduled";
  messageId: UIMessageId;
  categoryTag: string;
};
export type NPSShown = {
  nextStatus: "shown";
};
export type NPSUpdateRequired = {
  nextStatus: "updateRequired";
};

export const toErrorPayload = (reason: string): NPSError => ({
  nextStatus: "error",
  reason
});
export const toIdlePayload = (): NPSIdle => ({
  nextStatus: "idle"
});
export const toLoadingContentPayload = (
  content: ThirdPartyMessagePrecondition
): NPSLoadingContent => ({
  nextStatus: "loadingContent",
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
export const toShownPayload = (): NPSShown => ({
  nextStatus: "shown"
});
export const toUpdateRequiredPayload = (): NPSUpdateRequired => ({
  nextStatus: "updateRequired"
});

export const errorPreconditionStatusAction = createStandardAction(
  "TO_ERROR_PRECONDITION_STATUS"
)<NPSError>();
export const idlePreconditionStatusAction = createStandardAction(
  "TO_IDLE_PRECONDITION_STATUS"
)<NPSIdle>();
export const loadingContentPreconditionStatusAction = createStandardAction(
  "TO_LOADING_CONTENT_PRECONDITION_STATUS"
)<NPSLoadingContent>();
export const retrievingDataPreconditionStatusAction = createStandardAction(
  "TO_RETRIEVING_DATA_PRECONDITION_STATUS"
)<NPSRetrievingData>();
export const scheduledPreconditionStatusAction = createStandardAction(
  "TO_SCHEDULED_PRECONDITION_STATUS"
)<NPSScheduled>();
export const shownPreconditionStatusAction = createStandardAction(
  "TO_SHOWN_PRECONDITION_STATUS"
)<NPSShown>();
export const updateRequiredPreconditionStatusAction = createStandardAction(
  "TO_UPDATE_REQUIRED_PRECONDITION_STATUS"
)<NPSUpdateRequired>();

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
