import * as React from "react";
import { ListItemHeader } from "@pagopa/io-app-design-system";
import { UIMessageId } from "../../types";
import { useIOSelector } from "../../../../store/hooks";
import { thirdPartyMessageAttachments } from "../../store/reducers/thirdPartyById";
import I18n from "../../../../i18n";
import { MessageDetailsAttachmentItem } from "./MessageDetailsAttachmentItem";

export type MessageDetailsAttachmentsProps = {
  messageId: UIMessageId;
};

export const MessageDetailsAttachments = ({
  messageId
}: MessageDetailsAttachmentsProps) => {
  const attachments = useIOSelector(state =>
    thirdPartyMessageAttachments(state, messageId)
  );

  const attachmentCount = attachments.length;
  if (attachmentCount === 0) {
    return null;
  }

  return (
    <>
      <ListItemHeader
        label={I18n.t("features.messages.attachments")}
        iconName={"attachment"}
      />
      {attachments.map((attachment, index) => (
        <MessageDetailsAttachmentItem
          attachment={attachment}
          bottomSpacer={index + 1 < attachmentCount}
          key={`MessageAttachment_${index}`}
          messageId={messageId}
        />
      ))}
    </>
  );
};
