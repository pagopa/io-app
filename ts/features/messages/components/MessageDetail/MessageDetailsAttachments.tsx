import * as React from "react";
import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import { ListItemHeader } from "@pagopa/io-app-design-system";
import { UIMessageId } from "../../types";
import { useIOSelector } from "../../../../store/hooks";
import { thirdPartyMessageAttachments } from "../../store/reducers/thirdPartyById";
import I18n from "../../../../i18n";
import { ATTACHMENT_CATEGORY } from "../../types/attachmentCategory";
import { MessageDetailsAttachmentItem } from "./MessageDetailsAttachmentItem";

export type MessageDetailsAttachmentsProps = {
  disabled?: boolean;
  messageId: UIMessageId;
  removeF24?: boolean;
};

export const MessageDetailsAttachments = ({
  disabled = false,
  messageId,
  removeF24 = false
}: MessageDetailsAttachmentsProps) => {
  const originalAttachments = useIOSelector(state =>
    thirdPartyMessageAttachments(state, messageId)
  );
  const attachments = pipe(
    removeF24,
    B.fold(
      () => originalAttachments,
      () =>
        originalAttachments.filter(
          attachment => attachment.category !== ATTACHMENT_CATEGORY.F24
        )
    )
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
          disabled={disabled}
          key={`MessageAttachment_${index}`}
          messageId={messageId}
        />
      ))}
    </>
  );
};
