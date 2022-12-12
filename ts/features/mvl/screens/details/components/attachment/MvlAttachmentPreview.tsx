import React from "react";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { UIMessageId } from "../../../../../../store/reducers/entities/messages/types";
import { MessageAttachmentPreview } from "../../../../../messages/components/MessageAttachmentPreview";
import { MvlParamsList } from "../../../../navigation/params";
import { UIAttachmentId } from "../../../../../../store/reducers/entities/messages/types";

export type MvlAttachmentPreviewNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachmentId: UIAttachmentId;
}>;

export const MvlAttachmentPreview = (
  props: IOStackNavigationRouteProps<MvlParamsList, "MVL_ATTACHMENT">
): React.ReactElement => {
  const messageId = props.route.params.messageId;
  const attachmentId = props.route.params.attachmentId;
  return (
    <MessageAttachmentPreview
      messageId={messageId}
      attachmentId={attachmentId}
    />
  );
};
