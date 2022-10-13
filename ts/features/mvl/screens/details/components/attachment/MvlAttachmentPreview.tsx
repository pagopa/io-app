import React from "react";
import { MvlAttachmentId } from "../../../../types/mvlData";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { MvlParamsList } from "../../../../navigation/params";
import { MessageAttachmentPreview } from "../../../../../messages/components/MessageAttachmentPreview";
import { UIMessageId } from "../../../../../../store/reducers/entities/messages/types";

export type MvlAttachmentPreviewNavigationParams = Readonly<{
  messageId: UIMessageId;
  attachmentId: MvlAttachmentId;
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
