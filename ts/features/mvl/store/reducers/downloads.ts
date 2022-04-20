import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { IndexedById } from "../../../../store/helpers/indexer";
import { Action } from "../../../../store/actions/types";
import { mvlAttachmentDownload } from "../actions/downloads";
import {
  toError,
  toLoading,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";

export type MvlDownloads = IndexedById<pot.Pot<string, Error>>;

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
      return toLoading(action.payload, state);
    case getType(mvlAttachmentDownload.success):
      return toSome(action.payload.id, state, action.payload.path);
    case getType(mvlAttachmentDownload.failure):
      return toError(action.payload.id, state, action.payload.error);
  }
  return state;
};
