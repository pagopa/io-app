import { useCallback, useEffect, useState } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import ReactNativeBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";
import { identity, pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import i18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { ContentTypeValues } from "../../../types/contentType";
import { isAndroid } from "../../../utils/platform";
import { showToast } from "../../../utils/showToast";
import { downloadAttachment } from "../../../store/actions/messages";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { downloadPotForMessageAttachmentSelector } from "../../../store/reducers/entities/messages/downloads";
import { trackThirdPartyMessageAttachmentShowPreview } from "../../../utils/analytics";
import { isTestEnv } from "../../../utils/environment";

const taskCopyToMediaStore = (
  { displayName, contentType }: UIAttachment,
  path: string
) =>
  TE.tryCatch(
    () =>
      ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        {
          name: displayName,
          parentFolder: "",
          mimeType: contentType
        },
        "Download",
        path
      ),
    E.toError
  );

const taskAddCompleteDownload = (
  { displayName, contentType }: UIAttachment,
  path: string
) =>
  TE.tryCatch(
    () =>
      ReactNativeBlobUtil.android.addCompleteDownload({
        mime: contentType,
        title: displayName,
        showNotification: true,
        description: displayName,
        path
      }),
    E.toError
  );

const taskDownloadFileIntoAndroidPublicFolder = (
  attachment: UIAttachment,
  path: string
) =>
  pipe(
    isAndroid,
    TE.fromPredicate(identity, () => undefined),
    TE.mapLeft(() => ReactNativeBlobUtil.ios.presentOptionsMenu(path)),
    TE.chain(_ =>
      pipe(
        taskCopyToMediaStore(attachment, path),
        TE.chain(downloadFilePath =>
          taskAddCompleteDownload(attachment, downloadFilePath)
        ),
        TE.mapLeft(_ =>
          showToast(i18n.t("messageDetails.attachments.failing.details"))
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
export const useAttachmentDownload = (
  attachment: UIAttachment,
  openPreview: (attachment: UIAttachment) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useIODispatch();

  const downloadPot = useIOSelector(state =>
    downloadPotForMessageAttachmentSelector(state, attachment)
  );

  const openAttachment = useCallback(async () => {
    const download = pot.toUndefined(downloadPot);

    if (pot.isError(downloadPot)) {
      void mixpanelTrack("PN_ATTACHMENT_DOWNLOADFAILURE");
      showToast(i18n.t("messageDetails.attachments.failing.details"));
    } else if (download) {
      const { path, attachment } = download;

      if (attachment.contentType === ContentTypeValues.applicationPdf) {
        openPreview(attachment);
      } else {
        await taskDownloadFileIntoAndroidPublicFolder(attachment, path)();
      }
    }
  }, [downloadPot, openPreview]);

  useEffect(() => {
    const wasLoading = isLoading;
    const isStillLoading = pot.isLoading(downloadPot);

    if (wasLoading && !isStillLoading) {
      void openAttachment();
    }
    setIsLoading(isStillLoading);
  }, [downloadPot, isLoading, setIsLoading, openAttachment]);

  const isGenericAttachment = attachment.category === "GENERIC";
  const downloadAttachmentIfNeeded = async () => {
    if (pot.isLoading(downloadPot)) {
      return;
    }

    // Do not download the attachment for generic third party message
    if (isGenericAttachment) {
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
      TE.mapLeft(() => dispatch(downloadAttachment.request(attachment))),
      TE.chainW(() =>
        TE.tryCatch(
          () => openAttachment(),
          () => undefined
        )
      )
    )();
  };

  const onAttachmentSelect = () => {
    if (!isGenericAttachment) {
      void mixpanelTrack("PN_ATTACHMENT_OPEN");
    }
    void downloadAttachmentIfNeeded();
  };

  return {
    downloadPot,
    onAttachmentSelect
  };
};
