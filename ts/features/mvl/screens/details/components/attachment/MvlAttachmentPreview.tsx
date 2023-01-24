import React from "react";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import {
  UIMessageId,
  UIAttachment
} from "../../../../../../store/reducers/entities/messages/types";
import { MessageAttachmentPreview } from "../../../../../messages/components/MessageAttachmentPreview";
import { MvlParamsList } from "../../../../navigation/params";

export type MvlAttachmentPreviewNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachment: UIAttachment;
}>;

export const MvlAttachmentPreview = (
  props: IOStackNavigationRouteProps<MvlParamsList, "MVL_ATTACHMENT">
): React.ReactElement => {
  const messageId = props.route.params.messageId;
  const attachment = props.route.params.attachment;
  return (
    <MessageAttachmentPreview messageId={messageId} attachment={attachment} />
  );
};
