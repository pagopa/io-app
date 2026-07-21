import { createStandardAction } from "typesafe-actions";

import { MessageCategory } from "../../../../../definitions/communication/MessageCategory";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/communication/ThirdPartyMessagePrecondition";

// NPS stands for Next Precondition Status
export type NPSError = {
  nextStatus: "error";
  reason: string;
};
export type NPSIdle = {
  nextStatus: "idle";
};
export type NPSLoadingContent = {
  content: ThirdPartyMessagePrecondition;
  nextStatus: "loadingContent";
};
export type NPSRetrievingData = {
  nextStatus: "retrievingData";
};
export type NPSScheduled = {
  categoryTag: MessageCategory["tag"];
  messageId: string;
  nextStatus: "scheduled";
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
  messageId: string,
  categoryTag: MessageCategory["tag"]
): NPSScheduled => ({
  nextStatus: "scheduled",
  messageId,
  categoryTag
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
export const updateRequiredPreconditionStatusAction = createStandardAction(
  "TO_UPDATE_REQUIRED_PRECONDITION_STATUS"
)<NPSUpdateRequired>();
