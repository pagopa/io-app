import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
  DownloadAttachmentCancel,
  clearRequestedAttachmentDownload,
  downloadAttachment,
  removeCachedAttachment
} from "../actions";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import {
  toError,
  toLoading,
  toNone,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../store/reducers/types";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";

export type Download = {
  attachment: ThirdPartyAttachment;
  path: string;
};

export type DownloadError = {
  attachment: ThirdPartyAttachment;
  error: Error;
};

type RequestedDownload = {
  messageId: string;
  attachmentId: string;
};

export type Downloads = {
  statusById: Record<string, IndexedById<pot.Pot<Download, Error>> | undefined>;
  requestedDownload?: RequestedDownload;
};

export const INITIAL_STATE: Downloads = {
  statusById: {}
};

/**
 * A reducer to store all downloads
 */
export const downloadsReducer = (
  state: Downloads = INITIAL_STATE,
  action: Action
): Downloads => {
  switch (action.type) {
    case getType(downloadAttachment.request):
      return {
        ...state,
        statusById: {
          ...state.statusById,
          [action.payload.messageId]: toLoading(
            action.payload.attachment.id,
            state.statusById[action.payload.messageId] ?? {}
          )
        },
        requestedDownload: {
          messageId: action.payload.messageId,
          attachmentId: action.payload.attachment.id
        }
      };
    case getType(downloadAttachment.success):
      return {
        ...state,
        statusById: {
          ...state.statusById,
          [action.payload.messageId]: toSome(
            action.payload.attachment.id,
            state.statusById[action.payload.messageId] ?? {},
            {
              attachment: action.payload.attachment,
              path: action.payload.path
            }
          )
        }
      };
    case getType(downloadAttachment.failure):
      return {
        ...state,
        statusById: {
          ...state.statusById,
          [action.payload.messageId]: toError(
            action.payload.attachment.id,
            state.statusById[action.payload.messageId] ?? {},
            action.payload.error
          )
        }
      };
    case getType(downloadAttachment.cancel):
      // the download was cancelled, so it goes back to none
      return {
        ...state,
        statusById: {
          ...state.statusById,
          [action.payload.messageId]: toNone(
            action.payload.attachment.id,
            state.statusById[action.payload.messageId] ?? {}
          )
        },

        requestedDownload: requestDownloadAfterCancelledAction(
          state,
          action.payload
        )
      };
    case getType(removeCachedAttachment):
      return {
        ...state,
        statusById: {
          ...state.statusById,
          [action.payload.messageId]: toNone(
            action.payload.attachment.id,
            state.statusById[action.payload.messageId] ?? {}
          )
        }
      };
    case getType(clearRequestedAttachmentDownload):
      return {
        ...state,
        requestedDownload: undefined
      };
  }
  return state;
};

export const isRequestedAttachmentDownloadSelector = (
  state: GlobalState,
  messageId: string,
  attachmentId: string
) =>
  isRequestedDownloadMatch(
    state.entities.messages.downloads.requestedDownload,
    messageId,
    attachmentId
  );

export const isDownloadingMessageAttachmentSelector = (
  state: GlobalState,
  messageId: string,
  attachmentId: string
) =>
  pipe(
    state.entities.messages.downloads.statusById[messageId],
    O.fromNullable,
    O.chainNullableK(messageDownloads => messageDownloads[attachmentId]),
    O.getOrElseW(() => pot.none),
    pot.isLoading
  );

export const requestedDownloadErrorSelector = (
  state: GlobalState,
  messageId: string,
  attachmentId: string
) => {
  const isRequestedDownload = isRequestedAttachmentDownloadSelector(
    state,
    messageId,
    attachmentId
  );
  const messageDownloads =
    state.entities.messages.downloads.statusById[messageId]?.[attachmentId];

  if (
    !isRequestedDownload ||
    messageDownloads == null ||
    !pot.isError(messageDownloads)
  ) {
    return undefined;
  }

  return messageDownloads.error;
};

export const downloadedMessageAttachmentSelector = (
  state: GlobalState,
  messageId: string,
  attachmentId: string
) =>
  pipe(
    state.entities.messages.downloads.statusById[messageId],
    O.fromNullable,
    O.chainNullableK(messageDownloads => messageDownloads[attachmentId]),
    O.map(pot.toOption),
    O.flatten,
    O.toUndefined
  );

const isRequestedDownloadMatch = (
  requestedDownload: RequestedDownload | undefined,
  messageId: string,
  attachmentId: string
) =>
  !!requestedDownload &&
  requestedDownload.messageId === messageId &&
  requestedDownload.attachmentId === attachmentId;
const requestDownloadAfterCancelledAction = (
  state: Downloads,
  cancelActionPayload: DownloadAttachmentCancel
) =>
  isRequestedDownloadMatch(
    state.requestedDownload,
    cancelActionPayload.messageId,
    cancelActionPayload.attachment.id
  )
    ? undefined
    : state.requestedDownload;
