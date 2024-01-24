import React, { useCallback, useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import ReactNativeBlobUtil from "react-native-blob-util";
import { FooterWithButtons } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { downloadedMessageAttachmentSelector } from "../store/reducers/downloads";
import { UIAttachment, UIAttachmentId, UIMessageId } from "../types";
import { isIos } from "../../../utils/platform";
import { share } from "../../../utils/share";
import { IOToast } from "../../../components/Toast";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { DSPdfViewer } from "../components/MessageAttachment/DSPdfViewer";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../navigation/params";
import {
  trackThirdPartyMessageAttachmentCorruptedFile,
  trackThirdPartyMessageAttachmentPreviewSuccess,
  trackThirdPartyMessageAttachmentUserAction
} from "../analytics";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  trackPNAttachmentOpen,
  trackPNAttachmentOpeningSuccess,
  trackPNAttachmentSave,
  trackPNAttachmentSaveShare,
  trackPNAttachmentShare
} from "../../pn/analytics";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

export type DSMessageAttachmentNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachmentId: UIAttachmentId;
  isPN: boolean;
  serviceId?: ServiceId;
}>;

const renderFooter = (
  attachment: UIAttachment,
  downloadPath: string,
  isPN: boolean,
  attachmentCategory?: string
) =>
  isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      primary={{
        type: "Solid",
        buttonProps: {
          accessibilityLabel: I18n.t("messagePDFPreview.singleBtn"),
          onPress: () => {
            onShare(isPN, attachmentCategory);
            ReactNativeBlobUtil.ios.presentOptionsMenu(downloadPath);
          },
          label: I18n.t("messagePDFPreview.singleBtn")
        }
      }}
    />
  ) : (
    <FooterWithButtons
      type={"ThreeButtonsInLine"}
      primary={{
        type: "Outline",
        buttonProps: {
          accessibilityLabel: I18n.t("global.buttons.share"),
          onPress: () => {
            onShare(isPN, attachmentCategory);
            share(`file://${downloadPath}`, undefined, false)().catch(_ => {
              IOToast.show(I18n.t("messagePDFPreview.errors.sharing"));
            });
          },
          label: I18n.t("global.buttons.share")
        }
      }}
      third={{
        type: "Outline",
        buttonProps: {
          accessibilityLabel: I18n.t("messagePDFPreview.save"),
          onPress: () => {
            onDownload(isPN, attachmentCategory);
            ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
              {
                name: attachment.displayName,
                parentFolder: "",
                mimeType: attachment.contentType
              },
              "Download",
              downloadPath
            )
              .then(_ => {
                IOToast.show(
                  I18n.t("messagePDFPreview.savedAtLocation", {
                    name: attachment.displayName
                  })
                );
              })
              .catch(_ => {
                IOToast.error(I18n.t("messagePDFPreview.errors.saving"));
              });
          },
          label: I18n.t("messagePDFPreview.save")
        }
      }}
      secondary={{
        type: "Solid",
        buttonProps: {
          accessibilityLabel: I18n.t("messagePDFPreview.open"),
          onPress: () => {
            onOpen(isPN, attachmentCategory);
            ReactNativeBlobUtil.android
              .actionViewIntent(downloadPath, attachment.contentType)
              .catch(_ => {
                IOToast.error(I18n.t("messagePDFPreview.errors.opening"));
              });
          },
          label: I18n.t("messagePDFPreview.open")
        }
      }}
    />
  );

const onPDFError = (
  messageId: UIMessageId,
  isPN: boolean,
  serviceId?: ServiceId,
  attachmentCategory?: string
) =>
  pipe(
    isPN,
    B.fold(
      () => {
        trackThirdPartyMessageAttachmentCorruptedFile(messageId, serviceId);
        IOToast.error(I18n.t("messageDetails.attachments.corruptedFile"));
      },
      () => trackPNAttachmentOpeningSuccess("error", attachmentCategory)
    )
  );

const onLoadComplete = (isPN: boolean, attachmentCategory?: string) =>
  pipe(
    isPN,
    B.fold(
      () => trackThirdPartyMessageAttachmentPreviewSuccess(),
      () => trackPNAttachmentOpeningSuccess("displayer", attachmentCategory)
    )
  );

const onShare = (isPN: boolean, attachmentCategory?: string) =>
  pipe(
    isPN,
    B.fold(
      () => trackThirdPartyMessageAttachmentUserAction("share"),
      () =>
        pipe(
          isIos,
          B.fold(
            () => trackPNAttachmentShare(attachmentCategory),
            () => trackPNAttachmentSaveShare(attachmentCategory)
          )
        )
    )
  );

const onOpen = (isPN: boolean, attachmentCategory?: string) =>
  pipe(
    isPN,
    B.fold(
      () => trackThirdPartyMessageAttachmentUserAction("open"),
      () => trackPNAttachmentOpen(attachmentCategory)
    )
  );

const onDownload = (isPN: boolean, attachmentCategory?: string) =>
  pipe(
    isPN,
    B.fold(
      () => trackThirdPartyMessageAttachmentUserAction("download"),
      () => trackPNAttachmentSave(attachmentCategory)
    )
  );

export const DSMessageAttachment = (
  props: IOStackNavigationRouteProps<
    MessagesParamsList,
    "MESSAGE_DETAIL_ATTACHMENT"
  >
): React.ReactElement => {
  const { messageId, attachmentId, isPN, serviceId } = props.route.params;
  const [isPDFRenderingError, setIsPDFRenderingError] = useState(false);

  const downloadedAttachment = useIOSelector(state =>
    downloadedMessageAttachmentSelector(state, messageId, attachmentId)
  );
  const attachmentOpt = downloadedAttachment?.attachment;
  const attachmentCategory = attachmentOpt?.category;
  const downloadPathOpt = downloadedAttachment?.path;

  const onPDFRenderingError = useCallback(() => {
    setIsPDFRenderingError(true);
    onPDFError(messageId, isPN, serviceId, attachmentCategory);
  }, [attachmentCategory, messageId, isPN, serviceId]);

  useHeaderSecondLevel({
    title: I18n.t("messagePDFPreview.title"),
    supportRequest: true
  });

  if (!attachmentOpt || !downloadPathOpt) {
    return (
      <OperationResultScreenContent
        pictogram={"umbrellaNew"}
        title={I18n.t("global.genericError")}
        subtitle={I18n.t("messageDetails.submitBugText")}
      />
    );
  }

  // Safe area view testId message-attachment-preview
  return (
    <>
      {isPDFRenderingError ? (
        <OperationResultScreenContent
          pictogram={"umbrellaNew"}
          title={I18n.t("messagePDFPreview.errors.previewing.title")}
          subtitle={I18n.t("messagePDFPreview.errors.previewing.body")}
        />
      ) : (
        <DSPdfViewer
          downloadPath={downloadPathOpt}
          onError={onPDFRenderingError}
          onLoadComplete={() => onLoadComplete(isPN, attachmentCategory)}
        />
      )}
      {renderFooter(attachmentOpt, downloadPathOpt, isPN, attachmentCategory)}
    </>
  );
};
