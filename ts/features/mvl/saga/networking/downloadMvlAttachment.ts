import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import ReactNativeBlobUtil from "react-native-blob-util";
import { call } from "typed-redux-saga/macro";
import { mvlAttachmentDownload } from "../../store/actions/downloads";
import { isIos } from "../../../../utils/platform";
import { fetchTimeout } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";

/**
 * Handle the download of an MVL attachment
 * @param bearerToken
 * @param action
 */
export async function* downloadMvlAttachment(
  bearerToken: SessionToken,
  action: ActionType<typeof mvlAttachmentDownload.request>
) {
  const attachment = action.payload;
  const savePath = isIos
    ? RNFS.DocumentDirectoryPath
    : RNFS.DownloadDirectoryPath;

  const result = await ReactNativeBlobUtil.config({
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
    yield* call(mvlAttachmentDownload.failure, {
      attachment,
      error
    });
    return;
  }

  const path = result.path();
  yield* call(mvlAttachmentDownload.success, { attachment, path });
}
