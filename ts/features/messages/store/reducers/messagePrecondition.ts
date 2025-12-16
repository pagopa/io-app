import {
  constFalse,
  constTrue,
  constUndefined,
  pipe
} from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import { getType } from "typesafe-actions";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/backend/ThirdPartyMessagePrecondition";
import { Action } from "../../../../store/actions/types";
import {
  errorPreconditionStatusAction,
  idlePreconditionStatusAction,
  loadingContentPreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  scheduledPreconditionStatusAction,
  shownPreconditionStatusAction,
  updateRequiredPreconditionStatusAction
} from "../actions/preconditions";
import { GlobalState } from "../../../../store/reducers/types";
import { isPnAppVersionSupportedSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { TagEnum as SENDTagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { MessageCategory } from "../../../../../definitions/backend/MessageCategory";

// MPS stands for Message Precondition Status
type MPSError = {
  state: "error";
  messageId: string;
  categoryTag: MessageCategory["tag"];
  reason: string;
};
type MPSIdle = {
  state: "idle";
};
type MPSLoadingContent = {
  state: "loadingContent";
  messageId: string;
  categoryTag: MessageCategory["tag"];
  content: ThirdPartyMessagePrecondition;
};
type MPSRetrievingData = {
  state: "retrievingData";
  messageId: string;
  categoryTag: MessageCategory["tag"];
};
type MPSScheduled = {
  state: "scheduled";
  messageId: string;
  categoryTag: MessageCategory["tag"];
};
type MPSShown = {
  state: "shown";
  messageId: string;
  categoryTag: MessageCategory["tag"];
  content: ThirdPartyMessagePrecondition;
};
type MPSUpdateRequired = {
  state: "updateRequired";
};

export type MessagePreconditionStatus =
  | MPSError
  | MPSIdle
  | MPSLoadingContent
  | MPSRetrievingData
  | MPSScheduled
  | MPSShown
  | MPSUpdateRequired;

const INITIAL_STATE: MPSIdle = {
  state: "idle"
};

export const preconditionReducer = (
  state: MessagePreconditionStatus = INITIAL_STATE,
  action: Action
): MessagePreconditionStatus => {
  switch (action.type) {
    case getType(errorPreconditionStatusAction):
      return foldPreconditionStatus(
        () => state,
        () => state,
        loadingContentStatus =>
          toErrorMPS(
            loadingContentStatus.messageId,
            loadingContentStatus.categoryTag,
            action.payload.reason
          ), // From Loading Content to Error
        retrievingDataStatus =>
          toErrorMPS(
            retrievingDataStatus.messageId,
            retrievingDataStatus.categoryTag,
            action.payload.reason
          ), // From Retrieving Data to Error
        () => state,
        shownStatus =>
          toErrorMPS(
            shownStatus.messageId,
            shownStatus.categoryTag,
            action.payload.reason
          ), // From Retrieving Data to Error,
        () => state
      )(state);
    case getType(idlePreconditionStatusAction):
      return foldPreconditionStatus(
        () => toIdleMPS(), // From Error to Idle
        () => state,
        () => toIdleMPS(), // From Loading Content to Idle,
        () => toIdleMPS(), // From Retrieving Data to Idle,
        () => state,
        () => toIdleMPS(), // From Shown to Idle
        () => toIdleMPS() // From Update Required to Idle
      )(state);
    case getType(loadingContentPreconditionStatusAction):
      return foldPreconditionStatus(
        () => state,
        () => state,
        () => state,
        retrievingDataStatus => {
          if (action.payload.skipLoading) {
            return toShownMPS(
              retrievingDataStatus.messageId,
              retrievingDataStatus.categoryTag,
              action.payload.content
            ); // From Retrieving Data to Shown
          } else {
            return toLoadingContentMPS(
              retrievingDataStatus.messageId,
              retrievingDataStatus.categoryTag,
              action.payload.content
            ); // From Retrieving Data to Loading Content
          }
        },
        () => state,
        () => state,
        () => state
      )(state);
    case getType(retrievingDataPreconditionStatusAction):
      return foldPreconditionStatus(
        errorStatus =>
          toRetrievingDataMPS(errorStatus.messageId, errorStatus.categoryTag), // From Error to Retrieving Data
        () => state,
        () => state,
        () => state,
        scheduledStatus =>
          toRetrievingDataMPS(
            scheduledStatus.messageId,
            scheduledStatus.categoryTag
          ), // From Scheduled to Retrieving Data
        () => state,
        () => state
      )(state);
    case getType(scheduledPreconditionStatusAction):
      return foldPreconditionStatus(
        () => state,
        () =>
          toScheduledMPS(action.payload.messageId, action.payload.categoryTag), // From Idle to Scheduled
        () => state,
        () => state,
        () => state,
        () => state,
        () => state
      )(state);
    case getType(shownPreconditionStatusAction):
      return foldPreconditionStatus(
        () => state,
        () => state,
        loadingContentStatus =>
          toShownMPS(
            loadingContentStatus.messageId,
            loadingContentStatus.categoryTag,
            loadingContentStatus.content
          ), // From Loading Content to Shown
        () => state,
        () => state,
        () => state,
        () => state
      )(state);
    case getType(updateRequiredPreconditionStatusAction):
      return foldPreconditionStatus(
        () => state,
        () => state,
        () => state,
        () => state,
        () => toUpdateRequiredMPS(), // From Scheduled to Update Required,
        () => state,
        () => state
      )(state);
  }
  return state;
};

export const toErrorMPS = (
  messageId: string,
  categoryTag: MessageCategory["tag"],
  reason: string
): MPSError => ({
  state: "error",
  messageId,
  categoryTag,
  reason
});
export const toIdleMPS = (): MPSIdle => ({
  state: "idle"
});
export const toLoadingContentMPS = (
  messageId: string,
  categoryTag: MessageCategory["tag"],
  content: ThirdPartyMessagePrecondition
): MPSLoadingContent => ({
  state: "loadingContent",
  messageId,
  categoryTag,
  content
});
export const toRetrievingDataMPS = (
  messageId: string,
  categoryTag: MessageCategory["tag"]
): MPSRetrievingData => ({
  state: "retrievingData",
  messageId,
  categoryTag
});
export const toScheduledMPS = (
  messageId: string,
  categoryTag: MessageCategory["tag"]
): MPSScheduled => ({
  state: "scheduled",
  messageId,
  categoryTag
});
export const toShownMPS = (
  messageId: string,
  categoryTag: MessageCategory["tag"],
  content: ThirdPartyMessagePrecondition
): MPSShown => ({
  state: "shown",
  messageId,
  categoryTag,
  content
});
export const toUpdateRequiredMPS = (): MPSUpdateRequired => ({
  state: "updateRequired"
});

export const foldPreconditionStatus =
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
      scheduled =>
        pipe(
          scheduled.categoryTag === SENDTagEnum.PN,
          B.fold(constFalse, () =>
            pipe(
              state,
              isPnAppVersionSupportedSelector,
              appVersionSupported => !appVersionSupported
            )
          )
        ),
      constFalse,
      constTrue
    )
  );

export const preconditionsTitleContentSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      () => "empty" as const,
      constUndefined,
      () => "header" as const,
      () => "loading" as const,
      constUndefined,
      () => "header" as const,
      () => "empty" as const
    )
  );

export const preconditionsTitleSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      constUndefined,
      constUndefined,
      loadingContentStatus => loadingContentStatus.content.title,
      constUndefined,
      constUndefined,
      shownStatus => shownStatus.content.title,
      constUndefined
    )
  );

export const preconditionsContentSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      _ => "error" as const,
      constUndefined,
      _ => "content" as const,
      _ => "loading" as const,
      constUndefined,
      _ => "content" as const,
      _ => "update" as const
    )
  );

export const preconditionsContentMarkdownSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      constUndefined,
      constUndefined,
      loadingContentStatus => loadingContentStatus.content.markdown,
      constUndefined,
      constUndefined,
      shownStatus => shownStatus.content.markdown,
      constUndefined
    )
  );

export const preconditionsFooterSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      _ => "view" as const,
      constUndefined,
      _ => "view" as const,
      _ => "view" as const,
      constUndefined,
      _ => "content" as const,
      _ => "update" as const
    )
  );

export const preconditionsCategoryTagSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      errorStatus => errorStatus.categoryTag,
      constUndefined,
      loadingContentStatus => loadingContentStatus.categoryTag,
      retrievingDataStatus => retrievingDataStatus.categoryTag,
      scheduledStatus => scheduledStatus.categoryTag,
      shownStatus => shownStatus.categoryTag,
      constUndefined
    )
  );

export const preconditionsMessageIdSelector = (state: GlobalState) =>
  pipe(
    state.entities.messages.precondition,
    foldPreconditionStatus(
      errorStatus => errorStatus.messageId,
      constUndefined,
      loadingContentStatus => loadingContentStatus.messageId,
      retrievingDataStatus => retrievingDataStatus.messageId,
      scheduledStatus => scheduledStatus.messageId,
      shownStatus => shownStatus.messageId,
      constUndefined
    )
  );
