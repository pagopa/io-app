import { ListItemHeader } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ReactNode } from "react";

import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { useIOSelector } from "../../../../store/hooks";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import { thirdPartyMessageAttachments } from "../../store/reducers/thirdPartyById";
import { ATTACHMENT_CATEGORY } from "../../types/attachmentCategory";
import { MessageDetailsAttachmentItem } from "./MessageDetailsAttachmentItem";

export type MessageDetailsAttachmentsProps = {
  banner?: ReactNode;
  disabled?: boolean;
  messageId: string;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
  serviceId: ServiceId;
};

export const MessageDetailsAttachments = ({
  banner,
  disabled = false,
  messageId,
  serviceId,
  sendOpeningSource,
  sendUserType
}: MessageDetailsAttachmentsProps) => {
  const originalAttachments = useIOSelector(state =>
    thirdPartyMessageAttachments(state, messageId)
  );
  const isSend = sendOpeningSource !== "not_set";
  const attachments = isSend
    ? originalAttachments.filter(
        attachment => attachment.category !== ATTACHMENT_CATEGORY.F24
      )
    : originalAttachments;

  const attachmentCount = attachments.length;
  if (attachmentCount === 0) {
    return null;
  }

  return (
    <>
      <ListItemHeader
        iconName={"attachment"}
        label={I18n.t("features.messages.attachments")}
      />
      {banner}
      {attachments.map((attachment, index) => (
        <MessageDetailsAttachmentItem
          attachment={attachment}
          bottomSpacer={index + 1 < attachmentCount}
          disabled={disabled}
          key={`MessageAttachment_${index}`}
          messageId={messageId}
          sendOpeningSource={sendOpeningSource}
          sendUserType={sendUserType}
          serviceId={serviceId}
        />
      ))}
    </>
  );
};
