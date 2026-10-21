import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import {
  FooterActions,
  FooterActionsInline,
  IOToast
} from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useState } from "react";
import ReactNativeBlobUtil from "react-native-blob-util";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { isTestEnv } from "../../../../utils/environment";
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
  attachmentDisplayName,
  toFileUri
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
          testID: "message-attachment-save-or-share-button",
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
      endAction={{
        testID: "message-attachment-save-button",
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
              IOToast.info(
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
      startAction={{
        testID: "message-attachment-share-button",
        color: "primary",
        label: I18n.t("messagePDFPreview.share"),
        accessibilityLabel: I18n.t("messagePDFPreview.shareAccessibility"),
        onPress: () => {
          onShare(isPN, attachmentCategory);
          share(toFileUri(downloadPath), undefined, false)().catch(_ => {
            IOToast.error(I18n.t("messagePDFPreview.errors.sharing"));
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
) => {
  if (isPN) {
    trackPNAttachmentOpeningSuccess("error", attachmentCategory);
  } else {
    trackThirdPartyMessageAttachmentCorruptedFile(messageId, serviceId);
    IOToast.error(I18n.t("messageDetails.attachments.corruptedFile"));
  }
};

const onLoadComplete = (isPN: boolean, attachmentCategory?: string) => {
  if (isPN) {
    trackPNAttachmentOpeningSuccess("displayer", attachmentCategory);
  } else {
    trackThirdPartyMessageAttachmentPreviewSuccess();
  }
};

const onShare = (isPN: boolean, attachmentCategory?: string) => {
  if (isPN) {
    if (isIos) {
      trackPNAttachmentSaveShare(attachmentCategory);
    } else {
      trackPNAttachmentShare(attachmentCategory);
    }
  } else {
    trackThirdPartyMessageAttachmentUserAction("share");
  }
};

const onDownload = (isPN: boolean, attachmentCategory?: string) => {
  if (isPN) {
    trackPNAttachmentSave(attachmentCategory);
  } else {
    trackThirdPartyMessageAttachmentUserAction("download");
  }
};

export type MessageAttachmentProps = {
  attachmentId: string;
  isPN: boolean;
  messageId: string;
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
        subtitle={I18n.t("messageDetails.submitBugText")}
        testID="message-attachment-generic-error"
        title={I18n.t("global.genericError")}
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
          subtitle={I18n.t("messagePDFPreview.errors.previewing.body")}
          testID="message-attachment-preview-error"
          title={I18n.t("messagePDFPreview.errors.previewing.title")}
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

export const testable = isTestEnv ? { MessageAttachmentFooter } : undefined;
