import React from "react";
import I18n from "../../i18n";
import {
  UIMessageId,
  UIAttachment
} from "../../store/reducers/entities/messages/types";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MessageAttachmentPreview } from "../../features/messages/components/MessageAttachmentPreview";
import { MessagesParamsList } from "../../navigation/params/MessagesParamsList";
import { showToast } from "../../utils/showToast";
import { getServiceByMessageId } from "../../store/reducers/entities/messages/paginatedById";
import { useIOSelector } from "../../store/hooks";
import {
  trackThirdPartyMessageAttachmentCorruptedFile,
  trackThirdPartyMessageAttachmentPreviewSuccess,
  trackThirdPartyMessageAttachmentUserAction
} from "../../utils/analytics";

export type MessageDetailAttachmentNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachment: UIAttachment;
}>;

export const MessageDetailAttachment = (
  props: IOStackNavigationRouteProps<
    MessagesParamsList,
    "MESSAGE_DETAIL_ATTACHMENT"
  >
): React.ReactElement => {
  const messageId = props.route.params.messageId;
  const attachment = props.route.params.attachment;
  const serviceId = useIOSelector(state =>
    getServiceByMessageId(state, messageId)
  );

  return (
    <MessageAttachmentPreview
      messageId={messageId}
      attachment={attachment}
      onPDFError={() => {
        trackThirdPartyMessageAttachmentCorruptedFile(messageId, serviceId);
        showToast(I18n.t("messageDetails.attachments.corruptedFile"));
      }}
      onLoadComplete={() => {
        trackThirdPartyMessageAttachmentPreviewSuccess();
      }}
      onDownload={() => {
        trackThirdPartyMessageAttachmentUserAction("download");
      }}
      onOpen={() => {
        trackThirdPartyMessageAttachmentUserAction("open");
      }}
      onShare={() => {
        trackThirdPartyMessageAttachmentUserAction("share");
      }}
    />
  );
};
