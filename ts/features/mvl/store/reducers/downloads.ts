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

export type MvlDownload = {
  attachment: MvlAttachment;
  path: string;
};

export type MvlDownloads = IndexedById<pot.Pot<MvlDownload, Error>>;

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
      return toLoading(action.payload.id, state);
    case getType(mvlAttachmentDownload.success):
      return toSome(action.payload.attachment.id, state, {
        attachment: action.payload.attachment,
        path: action.payload.path
      });
    case getType(mvlAttachmentDownload.failure):
      return toError(action.payload.attachment.id, state, action.payload.error);
    case getType(mvlAttachmentDownload.cancel):
      // the download was cancelled, so it goes back to none
      return toNone(action.payload.id, state);
    case getType(mvlRemoveCachedAttachment):
      return toNone(action.payload.id, state);
  }
  return state;
};

/**
 * From MvlAttachmentId to the download pot
 */
export const mvlAttachmentDownloadFromIdSelector = createSelector(
  [
    (state: GlobalState) => state.features.mvl.downloads,
    (_: GlobalState, id: MvlAttachmentId) => id
  ],
  (byId, id): pot.Pot<MvlDownload, Error> => byId[id] ?? pot.none
);
