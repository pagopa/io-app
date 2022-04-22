import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import ReactNativeBlobUtil from "react-native-blob-util";
import { call, cancelled } from "typed-redux-saga/macro";
import { put } from "typed-redux-saga/macro";
import { mvlAttachmentDownload } from "../../store/actions/downloads";
import { isIos } from "../../../../utils/platform";
import { fetchTimeout } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";

/**
 * Handle the download of an MVL attachment
 * @param bearerToken
 * @param action
 */
export function* downloadMvlAttachment(
  bearerToken: SessionToken,
  action: ActionType<typeof mvlAttachmentDownload.request>
) {
  const attachment = action.payload;

  try {
    const savePath = isIos
      ? RNFS.DocumentDirectoryPath
      : RNFS.DownloadDirectoryPath;

    const result = yield ReactNativeBlobUtil.config({
      path: savePath + "/" + attachment.displayName,
      timeout: fetchTimeout
    }).fetch("GET", attachment.resourceUrl.href, {
      Authorization: `Bearer ${bearerToken}`
    });
    const { status } = result.info();
    if (status !== 200) {
      const error = new Error(
        `error ${status} fetching ${attachment.resourceUrl.href}`
      );
      yield* put(
        mvlAttachmentDownload.failure({
          attachment,
          error
        })
      );
      return;
    }
    const path = result.path();
    yield* put(mvlAttachmentDownload.success({ attachment, path }));
  } finally {
    if (yield* cancelled()) {
      yield* put(
        mvlAttachmentDownload.failure({
          attachment
        })
      );
    }
  }
}
