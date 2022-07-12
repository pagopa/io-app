import { View } from "native-base";
import React, { useCallback, useEffect, useState } from "react";

import * as pot from "italia-ts-commons/lib/pot";
import ReactNativeBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";
import { RawCheckBox } from "../../../../../../components/core/selection/checkbox/RawCheckBox";
import { Body } from "../../../../../../components/core/typography/Body";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import i18n from "../../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { MvlAttachment, MvlAttachmentId } from "../../../../types/mvlData";
import { mvlPreferencesSetWarningForAttachments } from "../../../../store/actions";
import { showToast } from "../../../../../../utils/showToast";
import { mvlAttachmentDownload } from "../../../../store/actions/downloads";
import { mvlAttachmentDownloadFromIdSelector } from "../../../../store/reducers/downloads";
import { isIos } from "../../../../../../utils/platform";
import { ContentTypeValues } from "../../../../../../types/contentType";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import { mvlPreferencesSelector } from "../../../../store/reducers/preferences";

const BOTTOM_SHEET_HEIGHT = 375;

type BottomSheetProps = Readonly<{
  /**
   * Called on right-button press with the user's selected preferences.
   */
  onConfirm: (dontAskAgain: boolean) => void;

  /**
   * The user canceled the action via the UI.
   */
  onCancel: () => void;
}>;

const useDownloadAttachmentConfirmationBottomSheet = ({
  onConfirm,
  onCancel
}: BottomSheetProps) => {
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(false);

  return useIOBottomSheetModal(
    <View>
      <View spacer={true} />
      <Body>
        {i18n.t("features.mvl.details.attachments.bottomSheet.warning.body")}
      </Body>
      <View spacer={true} />
      <View style={IOStyles.row}>
        <RawCheckBox
          checked={dontAskAgain}
          onPress={() => setDontAskAgain(!dontAskAgain)}
        />
        <Body
          style={{ paddingLeft: 8 }}
          onPress={() => setDontAskAgain(!dontAskAgain)}
        >
          {i18n.t("features.mvl.details.attachments.bottomSheet.checkBox")}
        </Body>
      </View>
    </View>,
    i18n.t("features.mvl.details.attachments.bottomSheet.warning.title"),
    BOTTOM_SHEET_HEIGHT,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        ...cancelButtonProps(onCancel),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        ...confirmButtonProps(() => {
          onConfirm(dontAskAgain);
        }, i18n.t("global.buttons.continue")),
        onPressWithGestureHandler: true
      }}
    />
  );
};

export const useMvlAttachmentDownload = (
  attachment: MvlAttachment,
  openPreview: (attachmentId: MvlAttachmentId) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useIODispatch();

  const { showAlertForAttachments } = useIOSelector(mvlPreferencesSelector);

  const downloadPot = useIOSelector(state =>
    mvlAttachmentDownloadFromIdSelector(state, attachment.id)
  );

  const openAttachment = useCallback(async () => {
    const download = pot.toUndefined(downloadPot);

    if (pot.isError(downloadPot)) {
      showToast(
        i18n.t("features.mvl.details.attachments.bottomSheet.failing.details")
      );
    } else if (download) {
      const path = download.path;
      const attachment = download.attachment;
      if (attachment.contentType === ContentTypeValues.applicationPdf) {
        openPreview(attachment.id);
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

    const path = pot.toUndefined(downloadPot)?.path;
    const fileExists = path !== undefined ? await RNFS.exists(path) : false;
    if (fileExists) {
      await openAttachment();
    } else {
      dispatch(mvlAttachmentDownload.request(attachment));
    }
  };

  const { present, bottomSheet, dismiss } =
    useDownloadAttachmentConfirmationBottomSheet({
      onConfirm: dontAskAgain => {
        dispatch(mvlPreferencesSetWarningForAttachments(!dontAskAgain));
        dismiss();
        void downloadAttachmentIfNeeded();
      },
      onCancel: () => {
        dismiss();
      }
    });

  const onAttachmentSelect = () => {
    if (showAlertForAttachments) {
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
