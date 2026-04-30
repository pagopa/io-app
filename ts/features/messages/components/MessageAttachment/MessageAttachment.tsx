import {
  FooterActions,
  FooterActionsInline,
  IOToast
} from "@pagopa/io-app-design-system";
import * as B from "fp-ts/lib/boolean";
import { pipe } from "fp-ts/lib/function";
import { useCallback, useState } from "react";
import ReactNativeBlobUtil from "react-native-blob-util";
import I18n from "i18next";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { isIos } from "../../../../utils/platform";
import { share } from "../../../../utils/share";
import {
  trackPNAttachmentOpeningSuccess,
  trackPNAttachmentSave,
  trackPNAttachmentSaveShare,
  trackPNAttachmentShare
} from "../../../pn/analytics";
import {
  trackThirdPartyMessageAttachmentCorruptedFile,
  trackThirdPartyMessageAttachmentPreviewSuccess,
  trackThirdPartyMessageAttachmentUserAction
} from "../../analytics";
import { downloadedMessageAttachmentSelector } from "../../store/reducers/downloads";
import {
  attachmentContentType,
  attachmentDisplayName
} from "../../utils/attachments";
import { PdfViewer } from "./PdfViewer";

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
    <FooterActions
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("messagePDFPreview.singleBtn"),
          accessibilityLabel: I18n.t(
            "messagePDFPreview.singleBtnAccessibility"
          ),
          onPress: () => {
            onShare(isPN, attachmentCategory);
            ReactNativeBlobUtil.ios.presentOptionsMenu(downloadPath);
          }
        }
      }}
    />
  ) : (
    <FooterActionsInline
      startAction={{
        color: "primary",
        label: I18n.t("messagePDFPreview.share"),
        accessibilityLabel: I18n.t("messagePDFPreview.shareAccessibility"),
        onPress: () => {
          onShare(isPN, attachmentCategory);
          share(`file://${downloadPath}`, undefined, false)().catch(_ => {
            IOToast.show(I18n.t("messagePDFPreview.errors.sharing"));
          });
        }
      }}
      endAction={{
        color: "primary",
        label: I18n.t("messagePDFPreview.save"),
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
        }
      }}
    />
  );

const onPDFError = (
  messageId: string,
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

export type MessageAttachmentProps = {
  messageId: string;
  attachmentId: string;
  isPN: boolean;
  serviceId?: ServiceId;
};

export const MessageAttachment = ({
  attachmentId,
  isPN,
  messageId,
  serviceId
}: MessageAttachmentProps) => {
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

  if (!attachmentOpt || !downloadPathOpt) {
    return (
      <OperationResultScreenContent
        pictogram={"umbrella"}
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
          pictogram={"umbrella"}
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
