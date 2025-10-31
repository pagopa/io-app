import { ReactNode } from "react";
import { ListItemHeader } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useIOSelector } from "../../../../store/hooks";
import { thirdPartyMessageAttachments } from "../../store/reducers/thirdPartyById";
import { ATTACHMENT_CATEGORY } from "../../types/attachmentCategory";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";
import { MessageDetailsAttachmentItem } from "./MessageDetailsAttachmentItem";

export type MessageDetailsAttachmentsProps = {
  banner?: ReactNode;
  disabled?: boolean;
  messageId: string;
  serviceId: ServiceId;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
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
  const isSend = sendUserType !== "not_set";
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
        label={I18n.t("features.messages.attachments")}
        iconName={"attachment"}
      />
      {banner}
      {attachments.map((attachment, index) => (
        <MessageDetailsAttachmentItem
          attachment={attachment}
          bottomSpacer={index + 1 < attachmentCount}
          sendOpeningSource={sendOpeningSource}
          sendUserType={sendUserType}
          disabled={disabled}
          key={`MessageAttachment_${index}`}
          messageId={messageId}
          serviceId={serviceId}
        />
      ))}
    </>
  );
};
