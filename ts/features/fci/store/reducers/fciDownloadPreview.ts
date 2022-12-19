import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciClearStateRequest, fciDownloadPreview } from "../actions";

export type FciDownload = {
  path: string;
};

export type FciDownloadPreviewState = pot.Pot<FciDownload, NetworkError>;

const initialState: FciDownloadPreviewState = pot.none;

/**
 * Store download info for FCI document
 */
const fciDownloadPreviewReducer = (
  state: FciDownloadPreviewState = initialState,
  action: Action
): FciDownloadPreviewState => {
  switch (action.type) {
    case getType(fciDownloadPreview.request):
      return pot.toLoading(state);
    case getType(fciDownloadPreview.success):
      return pot.some(action.payload);
    case getType(fciDownloadPreview.failure):
      return pot.toError(state, action.payload);
    case getType(fciDownloadPreview.cancel):
    case getType(fciClearStateRequest):
      return initialState;
  }
  return state;
};

// Selectors
export const fciDownloadPreviewSelector = (
  state: GlobalState
): FciDownloadPreviewState => state.features.fci.documentPreview;

export const fciDownloadPathSelector = createSelector(
  fciDownloadPreviewSelector,
  downloadPath => (pot.isSome(downloadPath) ? downloadPath.value.path : "")
);

export default fciDownloadPreviewReducer;
