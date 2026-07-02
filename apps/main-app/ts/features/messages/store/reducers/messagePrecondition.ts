import { getType } from "typesafe-actions";
import { ThirdPartyMessagePrecondition } from "../../../../../definitions/communication/ThirdPartyMessagePrecondition";
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
import { TagEnum as SENDTagEnum } from "../../../../../definitions/communication/MessageCategoryPN";
import { MessageCategory } from "../../../../../definitions/communication/MessageCategory";

type MessagePreconditionData = {
  messageId: string;
  categoryTag: MessageCategory["tag"];
};

type ErrorPreconditionStatus = MessagePreconditionData & {
  state: "error";
  reason: string;
};
type IdlePreconditionStatus = {
  state: "idle";
};
type LoadingContentPreconditionStatus = MessagePreconditionData & {
  state: "loadingContent";
  content: ThirdPartyMessagePrecondition;
};
type RetrievingDataPreconditionStatus = MessagePreconditionData & {
  state: "retrievingData";
};
type ScheduledPreconditionStatus = MessagePreconditionData & {
  state: "scheduled";
};
type ShownPreconditionStatus = MessagePreconditionData & {
  state: "shown";
  content: ThirdPartyMessagePrecondition;
};
type UpdateRequiredPreconditionStatus = {
  state: "updateRequired";
};

export type MessagePreconditionStatus =
  | ErrorPreconditionStatus
  | IdlePreconditionStatus
  | LoadingContentPreconditionStatus
  | RetrievingDataPreconditionStatus
  | ScheduledPreconditionStatus
  | ShownPreconditionStatus
  | UpdateRequiredPreconditionStatus;

type MessagePreconditionState = MessagePreconditionStatus["state"];
type ContentPreconditionStatus =
  | LoadingContentPreconditionStatus
  | ShownPreconditionStatus;
type MessagePreconditionStatusWithData = Exclude<
  MessagePreconditionStatus,
  IdlePreconditionStatus | UpdateRequiredPreconditionStatus
>;
type PreconditionTitleContent = "empty" | "header" | "loading";
type PreconditionContent = "content" | "error" | "loading" | "update";
type PreconditionFooter = "content" | "update" | "view";
type PreconditionContentLayout = {
  title: PreconditionTitleContent;
  content: PreconditionContent;
  footer: PreconditionFooter;
};

const INITIAL_STATE: IdlePreconditionStatus = {
  state: "idle"
};

export const preconditionReducer = (
  state: MessagePreconditionStatus = INITIAL_STATE,
  action: Action
): MessagePreconditionStatus => {
  switch (action.type) {
    case getType(errorPreconditionStatusAction):
      if (
        state.state === "loadingContent" ||
        state.state === "retrievingData" ||
        state.state === "shown"
      ) {
        return {
          state: "error",
          messageId: state.messageId,
          categoryTag: state.categoryTag,
          reason: action.payload.reason
        };
      }
      break;
    case getType(idlePreconditionStatusAction):
      if (state.state !== "scheduled") {
        return { state: "idle" };
      }
      break;

    case getType(loadingContentPreconditionStatusAction):
      if (state.state === "retrievingData") {
        return {
          state: action.payload.skipLoading ? "shown" : "loadingContent",
          messageId: state.messageId,
          categoryTag: state.categoryTag,
          content: action.payload.content
        };
      }
      break;

    case getType(retrievingDataPreconditionStatusAction):
      if (state.state === "error" || state.state === "scheduled") {
        return {
          state: "retrievingData",
          messageId: state.messageId,
          categoryTag: state.categoryTag
        };
      }
      break;

    case getType(scheduledPreconditionStatusAction):
      if (state.state === "idle") {
        return {
          state: "scheduled",
          messageId: action.payload.messageId,
          categoryTag: action.payload.categoryTag
        };
      }
      break;

    case getType(shownPreconditionStatusAction):
      if (state.state === "loadingContent") {
        return {
          state: "shown",
          messageId: state.messageId,
          categoryTag: state.categoryTag,
          content: state.content
        };
      }
      break;

    case getType(updateRequiredPreconditionStatusAction):
      if (state.state === "scheduled") {
        return { state: "updateRequired" };
      }

      break;
  }
  return state;
};

const hasPreconditionContent = (
  precondition: MessagePreconditionStatus
): precondition is ContentPreconditionStatus =>
  precondition.state === "loadingContent" || precondition.state === "shown";

const hasPreconditionMessage = (
  precondition: MessagePreconditionStatus
): precondition is MessagePreconditionStatusWithData =>
  precondition.state !== "idle" && precondition.state !== "updateRequired";

const getMessagePrecondition = (state: GlobalState) =>
  state.entities.messages.precondition;

export const shouldPresentPreconditionsBottomSheetSelector = (
  state: GlobalState
) => getMessagePrecondition(state).state === "scheduled";

export const preconditionsRequireAppUpdateSelector = (state: GlobalState) => {
  const precondition = getMessagePrecondition(state);

  if (precondition.state === "updateRequired") {
    return true;
  }

  return (
    precondition.state === "scheduled" &&
    precondition.categoryTag === SENDTagEnum.PN &&
    !isPnAppVersionSupportedSelector(state)
  );
};

export const preconditionsTitleSelector = (state: GlobalState) => {
  const precondition = getMessagePrecondition(state);

  return hasPreconditionContent(precondition)
    ? precondition.content.title
    : undefined;
};

export const preconditionsContentMarkdownSelector = (state: GlobalState) => {
  const precondition = getMessagePrecondition(state);

  return hasPreconditionContent(precondition)
    ? precondition.content.markdown
    : undefined;
};

export const preconditionsCategoryTagSelector = (state: GlobalState) => {
  const precondition = getMessagePrecondition(state);

  return hasPreconditionMessage(precondition)
    ? precondition.categoryTag
    : undefined;
};

export const preconditionsMessageIdSelector = (state: GlobalState) => {
  const precondition = getMessagePrecondition(state);

  return hasPreconditionMessage(precondition)
    ? precondition.messageId
    : undefined;
};

const PRECONDITION_CONTENT_LAYOUT_BY_STATE: Record<
  MessagePreconditionState,
  PreconditionContentLayout | undefined
> = {
  error: {
    title: "empty",
    content: "error",
    footer: "view"
  },
  idle: undefined,
  loadingContent: {
    title: "header",
    content: "content",
    footer: "view"
  },
  retrievingData: {
    title: "loading",
    content: "loading",
    footer: "view"
  },
  scheduled: undefined,
  shown: {
    title: "header",
    content: "content",
    footer: "content"
  },
  updateRequired: {
    title: "empty",
    content: "update",
    footer: "update"
  }
};

const getPreconditionContentByState = (state: GlobalState) =>
  PRECONDITION_CONTENT_LAYOUT_BY_STATE[getMessagePrecondition(state).state];
export const preconditionsTitleContentSelector = (state: GlobalState) =>
  getPreconditionContentByState(state)?.title;
export const preconditionsContentSelector = (state: GlobalState) =>
  getPreconditionContentByState(state)?.content;
export const preconditionsFooterSelector = (state: GlobalState) =>
  getPreconditionContentByState(state)?.footer;
