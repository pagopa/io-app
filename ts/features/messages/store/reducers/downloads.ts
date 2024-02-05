import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import {
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
import { UIAttachment, UIMessageId, UIAttachmentId } from "../../types";

export type Download = {
  attachment: UIAttachment;
  path: string;
};

export type DownloadError<T> = {
  attachment: UIAttachment;
  error: T;
};

type RequestedDownload = {
  messageId: UIMessageId;
  attachmentId: string;
};

export type Downloads = Record<
  UIMessageId,
  IndexedById<pot.Pot<Download, Error>> | undefined
> & { requestedDownload?: RequestedDownload };

export const INITIAL_STATE: Downloads = {};

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
        [action.payload.messageId]: toLoading(
          action.payload.id,
          state[action.payload.messageId] ?? {}
        ),
        requestedDownload: {
          messageId: action.payload.messageId,
          attachmentId: action.payload.id
        }
      };
    case getType(downloadAttachment.success):
      return {
        ...state,
        [action.payload.attachment.messageId]: toSome(
          action.payload.attachment.id,
          state[action.payload.attachment.messageId] ?? {},
          {
            attachment: action.payload.attachment,
            path: action.payload.path
          }
        )
      };
    case getType(downloadAttachment.failure):
      return {
        ...state,
        [action.payload.attachment.messageId]: toError(
          action.payload.attachment.id,
          state[action.payload.attachment.messageId] ?? {},
          action.payload.error
        )
      };
    case getType(downloadAttachment.cancel):
      // the download was cancelled, so it goes back to none
      return {
        ...state,
        [action.payload.messageId]: toNone(
          action.payload.id,
          state[action.payload.messageId] ?? {}
        ),
        requestedDownload: requestDownloadAfterCancelledAction(
          state,
          action.payload
        )
      };
    case getType(removeCachedAttachment):
      return {
        ...state,
        [action.payload.attachment.messageId]: toNone(
          action.payload.attachment.id,
          state[action.payload.attachment.messageId] ?? {}
        )
      };
    case getType(clearRequestedAttachmentDownload):
      return {
        ...state,
        requestedDownload: undefined
      };
  }
  return state;
};

/**
 * From attachment to the download pot
 */
export const downloadPotForMessageAttachmentSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  attachmentId: UIAttachmentId
) => state.entities.messages.downloads[messageId]?.[attachmentId] ?? pot.none;

export const isRequestedAttachmentDownloadSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  attachmentId: string
) =>
  isRequestedDownloadMatch(
    state.entities.messages.downloads.requestedDownload,
    messageId,
    attachmentId
  );

export const isDownloadingMessageAttachmentSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  attachmentId: string
) =>
  pipe(
    state.entities.messages.downloads[messageId],
    O.fromNullable,
    O.chainNullableK(messageDownloads => messageDownloads[attachmentId]),
    O.getOrElseW(() => pot.none),
    pot.isLoading
  );

export const hasErrorOccourredOnRequestedDownloadSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  attachmentId: string
) =>
  pipe(
    state.entities.messages.downloads[messageId],
    O.fromNullable,
    O.chainNullableK(messageDownloads => messageDownloads[attachmentId]),
    O.filter(() =>
      isRequestedDownloadMatch(
        state.entities.messages.downloads.requestedDownload,
        messageId,
        attachmentId
      )
    ),
    O.getOrElseW(() => pot.none),
    downloadPot => pot.isError(downloadPot) && !pot.isSome(downloadPot)
  );

export const downloadedMessageAttachmentSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  attachmentId: string
) =>
  pipe(
    state.entities.messages.downloads[messageId],
    O.fromNullable,
    O.chainNullableK(messageDownloads => messageDownloads[attachmentId]),
    O.map(pot.toOption),
    O.flatten,
    O.toUndefined
  );

const isRequestedDownloadMatch = (
  requestedDownload: RequestedDownload | undefined,
  messageId: UIMessageId,
  attachmentId: string
) =>
  !!requestedDownload &&
  requestedDownload.messageId === messageId &&
  requestedDownload.attachmentId === attachmentId;
const requestDownloadAfterCancelledAction = (
  state: Downloads,
  cancelActionPayload: UIAttachment
) =>
  isRequestedDownloadMatch(
    state.requestedDownload,
    cancelActionPayload.messageId,
    cancelActionPayload.id
  )
    ? undefined
    : state.requestedDownload;
