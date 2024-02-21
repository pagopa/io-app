import React, { useCallback, useState } from "react";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import ReactNativeBlobUtil from "react-native-blob-util";
import { FooterWithButtons } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { downloadedMessageAttachmentSelector } from "../store/reducers/downloads";
import { UIMessageId } from "../types";
import { isIos } from "../../../utils/platform";
import { share } from "../../../utils/share";
import { IOToast } from "../../../components/Toast";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { PdfViewer } from "../components/MessageAttachment/PdfViewer";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../navigation/params";
import {
  trackThirdPartyMessageAttachmentCorruptedFile,
  trackThirdPartyMessageAttachmentPreviewSuccess,
  trackThirdPartyMessageAttachmentUserAction
} from "../analytics";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  trackPNAttachmentOpeningSuccess,
  trackPNAttachmentSave,
  trackPNAttachmentSaveShare,
  trackPNAttachmentShare
} from "../../pn/analytics";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import {
  attachmentContentType,
  attachmentDisplayName
} from "../store/reducers/transformers";

export type MessageAttachmentNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachmentId: string;
  isPN: boolean;
  serviceId?: ServiceId;
}>;

type MessageAttachmentFooterProps = {
  attachmentCategory?: string;
  downloadPath: string;
  isPN: boolean;
  mimeType: string;
  name: string;
};

const MessageAttachmentFooter = ({
  attachmentCategory,
  downloadPath,
  isPN,
  mimeType,
  name
}: MessageAttachmentFooterProps) =>
  isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      primary={{
        type: "Solid",
        buttonProps: {
          accessibilityLabel: I18n.t(
            "messagePDFPreview.singleBtnAccessibility"
          ),
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
      type={"TwoButtonsInlineHalf"}
      secondary={{
        type: "Solid",
        buttonProps: {
          accessibilityLabel: I18n.t("messagePDFPreview.shareAccessibility"),
          onPress: () => {
            onShare(isPN, attachmentCategory);
            share(`file://${downloadPath}`, undefined, false)().catch(_ => {
              IOToast.show(I18n.t("messagePDFPreview.errors.sharing"));
            });
          },
          label: I18n.t("messagePDFPreview.share")
        }
      }}
      primary={{
        type: "Solid",
        buttonProps: {
          accessibilityLabel: I18n.t("messagePDFPreview.saveAccessibility"),
          onPress: () => {
            onDownload(isPN, attachmentCategory);
            ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
              {
                name,
                parentFolder: "",
                mimeType
              },
              "Download",
              downloadPath
            )
              .then(_ => {
                IOToast.show(
                  I18n.t("messagePDFPreview.savedAtLocation", {
                    name
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

const onDownload = (isPN: boolean, attachmentCategory?: string) =>
  pipe(
    isPN,
    B.fold(
      () => trackThirdPartyMessageAttachmentUserAction("download"),
      () => trackPNAttachmentSave(attachmentCategory)
    )
  );

export const MessageAttachment = (
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
    title: "",
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
  const name = attachmentDisplayName(attachmentOpt);
  const mimeType = attachmentContentType(attachmentOpt);
  return (
    <>
      {isPDFRenderingError ? (
        <OperationResultScreenContent
          pictogram={"umbrellaNew"}
          title={I18n.t("messagePDFPreview.errors.previewing.title")}
          subtitle={I18n.t("messagePDFPreview.errors.previewing.body")}
        />
      ) : (
        <PdfViewer
          downloadPath={downloadPathOpt}
          onError={onPDFRenderingError}
          onLoadComplete={() => onLoadComplete(isPN, attachmentCategory)}
        />
      )}
      <MessageAttachmentFooter
        attachmentCategory={attachmentCategory}
        downloadPath={downloadPathOpt}
        isPN={isPN}
        mimeType={mimeType}
        name={name}
      />
    </>
  );
};
