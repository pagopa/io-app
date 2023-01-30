import React from "react";
import I18n from "i18n-js";
import {
  UIMessageId,
  UIAttachment
} from "../../store/reducers/entities/messages/types";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MessageAttachmentPreview } from "../../features/messages/components/MessageAttachmentPreview";
import { MessagesParamsList } from "../../navigation/params/MessagesParamsList";
import { showToast } from "../../utils/showToast";

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

  return (
    <MessageAttachmentPreview
      messageId={messageId}
      attachment={attachment}
      onPDFError={() => {
        showToast(I18n.t("messageDetails.attachments.corruptedFile"));
      }}
    />
  );
};
