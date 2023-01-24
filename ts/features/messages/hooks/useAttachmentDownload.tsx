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
import { mvlPreferencesSetWarningForAttachments } from "../../mvl/store/actions";
import { mvlPreferencesSelector } from "../../mvl/store/reducers/preferences";
import { downloadAttachment } from "../../../store/actions/messages";
import { UIAttachment } from "../../../store/reducers/entities/messages/types";
import { downloadPotForMessageAttachmentSelector } from "../../../store/reducers/entities/messages/downloads";
import { useDownloadAttachmentBottomSheet } from "./useDownloadAttachmentBottomSheet";

export const useAttachmentDownload = (
  attachment: UIAttachment,
  openPreview: (attachment: UIAttachment) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useIODispatch();

  const { showAlertForAttachments } = useIOSelector(mvlPreferencesSelector);

  const downloadPot = useIOSelector(state =>
    downloadPotForMessageAttachmentSelector(state, attachment)
  );

  const openAttachment = useCallback(async () => {
    const download = pot.toUndefined(downloadPot);

    if (pot.isError(downloadPot)) {
      void mixpanelTrack("PN_ATTACHMENT_DOWNLOADFAILURE");
      showToast(
        i18n.t("features.mvl.details.attachments.bottomSheet.failing.details")
      );
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
          } catch (ex) {
            showToast(
              i18n.t(
                "features.mvl.details.attachments.bottomSheet.failing.details"
              )
            );
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

  const downloadAttachmentIfNeeded = async () => {
    if (pot.isLoading(downloadPot)) {
      return;
    }

    if (attachment.category === "GENERIC") {
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

  const { present, bottomSheet, dismiss } = useDownloadAttachmentBottomSheet({
    onConfirm: dontAskAgain => {
      void mixpanelTrack("PN_ATTACHMENTDISCLAIMER_ACCEPTED");
      dispatch(mvlPreferencesSetWarningForAttachments(!dontAskAgain));
      void downloadAttachmentIfNeeded();
      dismiss();
    },
    onCancel: () => {
      void mixpanelTrack("PN_ATTACHMENTDISCLAIMER_REJECTED");
      dismiss();
    }
  });

  const onAttachmentSelect = () => {
    void mixpanelTrack("PN_ATTACHMENT_OPEN");
    if (showAlertForAttachments) {
      void mixpanelTrack("PN_ATTACHMENTDISCLAIMER_SHOW_SUCCESS");
      present();
    } else {
      void downloadAttachmentIfNeeded();
    }
  };

  return {
    downloadPot,
    onAttachmentSelect,
    bottomSheet
  };
};
