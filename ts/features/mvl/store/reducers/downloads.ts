import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { IndexedById } from "../../../../store/helpers/indexer";
import { Action } from "../../../../store/actions/types";
import {
  mvlAttachmentDownload,
  mvlRemoveCachedAttachment
} from "../actions/downloads";
import {
  toError,
  toLoading,
  toNone,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../store/reducers/types";
import { MvlAttachment, MvlAttachmentId } from "../../types/mvlData";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";

export type MvlDownload = {
  attachment: MvlAttachment;
  path: string;
};

export type MvlDownloads = Record<
  UIMessageId,
  IndexedById<pot.Pot<MvlDownload, Error>>
>;

export const initialState: MvlDownloads = {};

/**
 * Store download info for MVL attachments
 * @param state
 * @param action
 */
export const mvlDownloadsReducer = (
  state: MvlDownloads = initialState,
  action: Action
): MvlDownloads => {
  switch (action.type) {
    case getType(mvlAttachmentDownload.request):
      return {
        ...state,
        [action.payload.messageId]: toLoading(
          action.payload.id,
          state[action.payload.messageId] ?? {}
        )
      };
    case getType(mvlAttachmentDownload.success):
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
    case getType(mvlAttachmentDownload.failure):
      return {
        ...state,
        [action.payload.attachment.messageId]: toError(
          action.payload.attachment.id,
          state[action.payload.attachment.messageId] ?? {},
          action.payload.error
        )
      };
    case getType(mvlAttachmentDownload.cancel):
      // the download was cancelled, so it goes back to none
      return {
        ...state,
        [action.payload.messageId]: toNone(
          action.payload.id,
          state[action.payload.messageId] ?? {}
        )
      };
    case getType(mvlRemoveCachedAttachment):
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
export const mvlDownloadFromAttachmentSelector = createSelector(
  [
    (state: GlobalState) => state.features.mvl.downloads,
    (
      _: GlobalState,
      attachment: { messageId: UIMessageId; id: MvlAttachmentId }
    ) => attachment
  ],
  (downloads, attachment): pot.Pot<MvlDownload, Error> => {
    const download = downloads[attachment.messageId];
    if (download) {
      return download[attachment.id] ?? pot.none;
    }
    return pot.none;
  }
);
