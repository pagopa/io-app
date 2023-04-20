import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import {
  downloadAttachment,
  removeCachedAttachment
} from "../../../actions/messages";
import { Action } from "../../../actions/types";
import { IndexedById } from "../../../helpers/indexer";
import { toError, toLoading, toNone, toSome } from "../../IndexedByIdPot";
import { GlobalState } from "../../types";
import { UIAttachment, UIMessageId, UIAttachmentId } from "./types";

export type Download = {
  attachment: UIAttachment;
  path: string;
};

export type DownloadError<T> = {
  attachment: UIAttachment;
  error: T;
};

export type Downloads = Record<
  UIMessageId,
  IndexedById<pot.Pot<Download, Error>>
>;

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
        )
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
  }
  return state;
};

/**
 * From attachment to the download pot
 */
export const downloadPotForMessageAttachmentSelector = createSelector(
  [
    (state: GlobalState) => state.entities.messages.downloads,
    (
      _: GlobalState,
      attachment: { messageId: UIMessageId; id: UIAttachmentId }
    ) => attachment
  ],
  (downloads, attachment): pot.Pot<Download, Error> => {
    const download = downloads[attachment.messageId];
    if (download) {
      return download[attachment.id] ?? pot.none;
    }
    return pot.none;
  }
);
