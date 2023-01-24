import React from "react";
import {
  UIMessageId,
  UIAttachment
} from "../../store/reducers/entities/messages/types";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { MessageAttachmentPreview } from "../../features/messages/components/MessageAttachmentPreview";
import { MessagesParamsList } from "../../navigation/params/MessagesParamsList";

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
      onError={() => {
        // TODO
      }}
      onLoadComplete={() => {
        // TODO
      }}
      onShare={() => {
        // TODO
      }}
      onOpen={() => {
        // TODO
      }}
      onDownload={() => {
        // TODO
      }}
    />
  );
};
