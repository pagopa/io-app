import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { identity, pipe } from "fp-ts/lib/function";
import { useCallback, useEffect, useState } from "react";
import ReactNativeBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { IOToast } from "../../../components/Toast";
import i18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isTestEnv } from "../../../utils/environment";
import { isAndroid } from "../../../utils/platform";
import { trackPNAttachmentDownloadFailure } from "../../pn/analytics";
import { trackThirdPartyMessageAttachmentShowPreview } from "../analytics";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment
} from "../store/actions";
import { downloadPotForMessageAttachmentSelector } from "../store/reducers/downloads";
import {
  attachmentContentType,
  attachmentDisplayName
} from "../store/reducers/transformers";
import { UIMessageId } from "../types";
import { ContentTypeValues } from "../types/contentType";

const taskCopyToMediaStore = (name: string, mimeType: string, path: string) =>
  TE.tryCatch(
    () =>
      ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        {
          name,
          parentFolder: "",
          mimeType
        },
        "Download",
        path
      ),
    E.toError
  );

const taskAddCompleteDownload = (name: string, mime: string, path: string) =>
  TE.tryCatch(
    () =>
      ReactNativeBlobUtil.android.addCompleteDownload({
        mime,
        title: name,
        showNotification: true,
        description: name,
        path
      }),
    E.toError
  );

const taskDownloadFileIntoAndroidPublicFolder = (
  name: string,
  mimeType: string,
  path: string
) =>
  pipe(
    isAndroid,
    TE.fromPredicate(identity, () => undefined),
    TE.mapLeft(() => ReactNativeBlobUtil.ios.presentOptionsMenu(path)),
    TE.chain(_ =>
      pipe(
        taskCopyToMediaStore(name, mimeType, path),
        TE.chain(downloadFilePath =>
          taskAddCompleteDownload(name, mimeType, downloadFilePath)
        ),
        TE.mapLeft(_ =>
          IOToast.error(i18n.t("messageDetails.attachments.failing.details"))
        )
      )
    )
  );

export const testableFunctions = isTestEnv
  ? {
      taskCopyToMediaStore,
      taskAddCompleteDownload,
      taskDownloadFileIntoAndroidPublicFolder
    }
  : undefined;

// This hook has a different behaviour if the attachment is a PN
// one or a generic third-party attachment.
// When selecting a PN attachment, this hook takes care of downloading
// the attachment before going into the attachment preview component.
// If the attachment is from a third-party message (generic attachment)
// then the download is delegated to another part of the application
export const useLegacyAttachmentDownload = (
  attachment: ThirdPartyAttachment,
  messageId: UIMessageId,
  downloadAttachmentBeforePreview: boolean = false,
  openPreview: (attachment: ThirdPartyAttachment) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useIODispatch();

  const downloadPot = useIOSelector(state =>
    downloadPotForMessageAttachmentSelector(state, messageId, attachment.id)
  );

  const openAttachment = useCallback(async () => {
    const download = pot.toUndefined(downloadPot);

    if (pot.isError(downloadPot)) {
      trackPNAttachmentDownloadFailure(attachment.category);
      IOToast.error(i18n.t("messageDetails.attachments.failing.details"));
    } else if (download) {
      const { path, attachment } = download;

      const contentType = attachmentContentType(attachment);
      if (contentType === ContentTypeValues.applicationPdf) {
        openPreview(attachment);
      } else {
        const name = attachmentDisplayName(attachment);
        await taskDownloadFileIntoAndroidPublicFolder(
          name,
          contentType,
          path
        )();
      }
    }
  }, [downloadPot, openPreview, attachment.category]);

  useEffect(() => {
    const wasLoading = isLoading;
    const isStillLoading = pot.isLoading(downloadPot);

    if (wasLoading && !isStillLoading) {
      void openAttachment();
    }
    setIsLoading(isStillLoading);
  }, [downloadPot, isLoading, setIsLoading, openAttachment]);

  const downloadAttachmentIfNeeded = async () => {
    if (pot.isLoading(downloadPot)) {
      return;
    }

    // Do not download the attachment for generic third party message
    if (!downloadAttachmentBeforePreview) {
      trackThirdPartyMessageAttachmentShowPreview();
      openPreview(attachment);
      return;
    }

    await pipe(
      downloadPot,
      pot.toOption,
      TE.fromOption(() => undefined),
      TE.chain(download =>
        TE.tryCatch(
          () => RNFS.exists(download.path),
          () => undefined
        )
      ),
      TE.filterOrElse(identity, () => undefined),
      TE.mapLeft(() => {
        dispatch(
          downloadAttachment.request({
            attachment,
            messageId,
            skipMixpanelTrackingOnFailure: true
          })
        );
      }),
      TE.chainW(() =>
        TE.tryCatch(
          () => {
            // We must dispatch this action in order to cancel any
            // other download that may be running (since we support
            // selecting other attachments while cancelling the
            // previous selected attachment's download)
            dispatch(cancelPreviousAttachmentDownload());
            return openAttachment();
          },
          () => undefined
        )
      )
    )();
  };

  const onAttachmentSelect = () => {
    void downloadAttachmentIfNeeded();
  };

  return {
    downloadPot,
    onAttachmentSelect
  };
};
