import ReactNativeBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";
import { call, cancelled, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { fetchTimeout } from "../../../../config";
import { getNetworkError } from "../../../../utils/errors";
import { getFileNameFromUrl } from "../../components/DocumentViewer";
import { fciDownloadPreview } from "../../store/actions";

export const FciDownloadPreviewDirectoryPath =
  RNFS.CachesDirectoryPath + "/fci";

/**
 * Builds the save path for the given attachment
 */
export const savePath = (url: string) =>
  FciDownloadPreviewDirectoryPath + "/" + getFileNameFromUrl(url);

/**
 * Handles the download of an Fci document preview
 */
export function* handleDownloadDocument(
  action: ActionType<typeof fciDownloadPreview.request>
) {
  const document = action.payload;

  try {
    const config = yield* call(ReactNativeBlobUtil.config, {
      path: savePath(document.url),
      timeout: fetchTimeout,
      fileCache: true
    });
    const result = yield* call(config.fetch, "GET", document.url);
    const { status } = result.info();
    if (status !== 200) {
      const error = new Error(`error ${status} fetching ${document.url}`);
      yield* put(fciDownloadPreview.failure(getNetworkError(error)));
      return;
    }
    const path = result.path();
    yield* put(fciDownloadPreview.success({ path }));
  } catch (error) {
    yield* put(fciDownloadPreview.failure(getNetworkError(error)));
  } finally {
    if (yield* cancelled()) {
      yield* put(fciDownloadPreview.cancel());
    }
  }
}
