import { constFalse, constTrue, constUndefined, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import { getType } from "typesafe-actions";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { Action } from "../../../../store/actions/types";
import { UIMessageId } from "../../types";
import {
  NPSError,
  NPSIdle,
  NPSLoadingContent,
  NPSRetrievingData,
  NPSScheduled,
  NPSShown,
  NPSUpdateRequired,
  NextPreconditionStatus,
  toNextMessagePreconditionStatus
} from "../actions/preconditions";
import { GlobalState } from "../../../../store/reducers/types";
import { isPnAppVersionSupportedSelector } from "../../../../store/reducers/backendStatus";
import { TagEnum as SENDTagEnum } from "../../../../../definitions/backend/MessageCategoryPN";

// MPS stands for Message Precondition Status
type MPSError = {
  state: "error";
  messageId: UIMessageId;
  categoryTag: string;
  reason: string;
};
type MPSIdle = {
  state: "idle";
};
type MPSLoadingContent = {
  state: "loadingContent";
  messageId: UIMessageId;
  categoryTag: string;
  content: ThirdPartyMessagePrecondition;
};
type MPSRetrievingData = {
  state: "retrievingData";
  messageId: UIMessageId;
  categoryTag: string;
};
type MPSScheduled = {
  state: "scheduled";
  messageId: UIMessageId;
  categoryTag: string;
};
type MPSShown = {
  state: "shown";
  messageId: UIMessageId;
  categoryTag: string;
  content: ThirdPartyMessagePrecondition;
};
type MPSUpdateRequired = {
  state: "updateRequired";
};

export type MessagePreconditionStatus =
  | MPSIdle
  | MPSScheduled
  | MPSUpdateRequired
  | MPSRetrievingData
  | MPSLoadingContent
  | MPSShown
  | MPSError;

const INITIAL_STATE: MPSIdle = {
  state: "idle"
};

export const preconditionReducer = (
  state: MessagePreconditionStatus = INITIAL_STATE,
  action: Action
): MessagePreconditionStatus => {
  switch (action.type) {
    case getType(toNextMessagePreconditionStatus): {
      const nextPreconditionStatus = action.payload;
      return pipe(
        state,
        foldPreconditionStatus(
          errorStatus =>
            pipe(
              // Error status
              nextPreconditionStatus,
              foldNextPreconditionStatus(
                _ => state,
                _ => toIdle(), // From Error to Idle
                _ => state,
                _ =>
                  toRetrievingData(
                    errorStatus.messageId,
                    errorStatus.categoryTag
                  ), // From Error to Retrieving Data
                _ => state,
                _ => state,
                _ => state
              )
            ),
          _ =>
            pipe(
              // Idle Status
              nextPreconditionStatus,
              foldNextPreconditionStatus(
                _ => state,
                _ => state,
                _ => state,
                _ => state,
                nextScheduled =>
                  toScheduled(
                    nextScheduled.messageId,
                    nextScheduled.categoryTag
                  ), // From Idle to Scheduled
                _ => state,
                _ => toUpdateRequired() // From Idle to Update Required
              )
            ),
          _ =>
            pipe(
              // Loading Content status
              nextPreconditionStatus,
              foldNextPreconditionStatus(
                nextError =>
                  toError(
                    nextError.messageId,
                    nextError.categoryTag,
                    nextError.reason
                  ), // From Loading Content to Error
                _ => state,
                _ => state,
                _ => state,
                _ => state,
                nextShown =>
                  toShown(
                    nextShown.messageId,
                    nextShown.categoryTag,
                    nextShown.content
                  ), // From Loading Content to Shown
                _ => state
              )
            ),
          _ =>
            pipe(
              // Retrieving Data status
              nextPreconditionStatus,
              foldNextPreconditionStatus(
                nextError =>
                  toError(
                    nextError.messageId,
                    nextError.categoryTag,
                    nextError.reason
                  ), // From Retrieving Data to Error
                _ => state,
                nextLoadingContent =>
                  toLoadingContent(
                    nextLoadingContent.messageId,
                    nextLoadingContent.categoryTag,
                    nextLoadingContent.content
                  ), // From Retrieving Data to Loading Content
                _ => state,
                _ => state,
                _ => state,
                _ => state
              )
            ),
          scheduledStatus =>
            pipe(
              // Scheduled status
              nextPreconditionStatus,
              foldNextPreconditionStatus(
                _ => state,
                _ => state,
                _ => state,
                _ =>
                  toRetrievingData(
                    scheduledStatus.messageId,
                    scheduledStatus.categoryTag
                  ), // From Scheduled to Retrieving Data
                _ => state,
                _ => state,
                _ => toUpdateRequired() // From Scheduled to Update Required
              )
            ),
          _ =>
            pipe(
              // Shown status
              nextPreconditionStatus,
              foldNextPreconditionStatus(
                _ => state,
                _ => toIdle(), // From Shown to Idle
                _ => state,
                _ => state,
                _ => state,
                _ => state,
                _ => state
              )
            ),
          // eslint-disable-next-line sonarjs/no-identical-functions
          _ =>
            pipe(
              // Update Required status
              nextPreconditionStatus,
              foldNextPreconditionStatus(
                _ => state,
                _ => toIdle(), // From Udpate Required to Idle
                _ => state,
                _ => state,
                _ => state,
                _ => state,
                _ => state
              )
            )
        )
      );
    }
  }
  return state;
};

const toError = (
  messageId: UIMessageId,
  categoryTag: string,
  reason: string
): MPSError => ({
  state: "error",
  messageId,
  categoryTag,
  reason
});
const toIdle = (): MPSIdle => ({
  state: "idle"
});
const toLoadingContent = (
  messageId: UIMessageId,
  categoryTag: string,
  content: ThirdPartyMessagePrecondition
): MPSLoadingContent => ({
  state: "loadingContent",
  messageId,
  categoryTag,
  content
});
const toRetrievingData = (
  messageId: UIMessageId,
  categoryTag: string
): MPSRetrievingData => ({
  state: "retrievingData",
  messageId,
  categoryTag
});
const toScheduled = (
  messageId: UIMessageId,
  categoryTag: string
): MPSScheduled => ({
  state: "scheduled",
  messageId,
  categoryTag
});
const toShown = (
  messageId: UIMessageId,
  categoryTag: string,
  content: ThirdPartyMessagePrecondition
): MPSShown => ({
  state: "shown",
  messageId,
  categoryTag,
  content
});
const toUpdateRequired = (): MPSUpdateRequired => ({
  state: "updateRequired"
});

const foldNextPreconditionStatus =
  <A>(
    onError: (status: NPSError) => A,
    onIdle: (status: NPSIdle) => A,
    onLoadingContent: (status: NPSLoadingContent) => A,
    onRetrievingData: (status: NPSRetrievingData) => A,
    onScheduled: (status: NPSScheduled) => A,
    onShown: (status: NPSShown) => A,
    onUpdateRequired: (status: NPSUpdateRequired) => A
  ) =>
  (nextPreconditionStatus: NextPreconditionStatus) => {
    switch (nextPreconditionStatus.nextStatus) {
      case "error":
        return onError(nextPreconditionStatus);
      case "loadingContent":
        return onLoadingContent(nextPreconditionStatus);
      case "retrievingData":
        return onRetrievingData(nextPreconditionStatus);
      case "scheduled":
        return onScheduled(nextPreconditionStatus);
      case "shown":
        return onShown(nextPreconditionStatus);
      case "updateRequired":
        return onUpdateRequired(nextPreconditionStatus);
    }
    return onIdle(nextPreconditionStatus);
  };

const foldPreconditionStatus =
  <A>(
    onError: (status: MPSError) => A,
    onIdle: (status: MPSIdle) => A,
    onLoadingContent: (status: MPSLoadingContent) => A,
    onRetrievingData: (status: MPSRetrievingData) => A,
    onScheduled: (status: MPSScheduled) => A,
    onShown: (status: MPSShown) => A,
    onUpdateRequired: (status: MPSUpdateRequired) => A
  ) =>
  (status: MessagePreconditionStatus) => {
    switch (status.state) {
      case "error":
        return onError(status);
      case "loadingContent":
        return onLoadingContent(status);
      case "retrievingData":
        return onRetrievingData(status);
      case "scheduled":
        return onScheduled(status);
      case "shown":
        return onShown(status);
      case "updateRequired":
        return onUpdateRequired(status);
    }
    return onIdle(status);
  };

export const shouldPresentPreconditionsBottomSheetSelector = (
  state: GlobalState
) => state.entities.messages.precondition.state === "scheduled";

export const preconditionsRequireAppUpdateSelector = (state: GlobalState) => 
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      constFalse,
      constFalse,
      constFalse,
      constFalse,
      scheduled => pipe(
        scheduled.categoryTag === SENDTagEnum.PN,
        B.fold(
          constFalse,
          () => pipe(
            state,
            isPnAppVersionSupportedSelector
          )
        )
      ),
      constFalse,
      constTrue
    ),
  );

export const preconditionTitleContentSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      () => "empty" as const,
      constUndefined,
      () => "title" as const,
      () => "loading" as const,
      constUndefined,
      () => "title" as const,
      () => "empty" as const
    )
  );