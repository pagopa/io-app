import * as pot from "italia-ts-commons/lib/pot";
import { IndexedById } from "../../../../store/helpers/indexer";
import { Action } from "../../../../store/actions/types";

export type MvlDownloads = IndexedById<pot.Pot<string, Error>>;

export const initialState: MvlDownloads = {};

/**
 * Store download info for MVL attachments
 * @param state
 * @param _
 */
export const mvlDownloadsReducer = (
  state: MvlDownloads = initialState,
  _: Action
): MvlDownloads => state;
