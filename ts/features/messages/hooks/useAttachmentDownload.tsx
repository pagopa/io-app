import { useCallback, useEffect, useState } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import ReactNativeBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";
import i18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { ContentTypeValues } from "../../../types/contentType";
import { isIos } from "../../../utils/platform";
import { showToast } from "../../../utils/showToast";
import { downloadAttachment } from "../../../store/actions/messages";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { downloadPotForMessageAttachmentSelector } from "../../../store/reducers/entities/messages/downloads";
import { trackThirdPartyMessageAttachmentShowPreview } from "../../../utils/analytics";

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
      const path = download.path;
      const attachment = download.attachment;
      if (attachment.contentType === ContentTypeValues.applicationPdf) {
        openPreview(attachment);
      } else {
        if (isIos) {
          ReactNativeBlobUtil.ios.presentOptionsMenu(path);
        } else {
          try {
            const downloadFilePath =
              await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
                {
                  name: attachment.displayName,
                  parentFolder: "",
                  mimeType: attachment.contentType
                },
                "Download",
                path
              );

            await ReactNativeBlobUtil.android.addCompleteDownload({
              mime: attachment.contentType,
              title: attachment.displayName,
              showNotification: true,
              description: attachment.displayName,
              path: downloadFilePath
            });
          } catch (e) {
            showToast(i18n.t("messageDetails.attachments.failing.details"));
          }
        }
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

    const path = pot.toUndefined(downloadPot)?.path;
    const fileExists = path !== undefined ? await RNFS.exists(path) : false;
    if (fileExists) {
      await openAttachment();
    } else {
      dispatch(downloadAttachment.request(attachment));
    }
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
