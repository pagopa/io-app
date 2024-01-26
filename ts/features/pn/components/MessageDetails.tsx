import React from "react";
import { ScrollView } from "react-native";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { UIMessageId } from "../../messages/types";
import { PNMessage } from "../store/types/types";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { MessageDetailHeader } from "../../messages/components/MessageDetail/MessageDetailHeader";
import { MessageDetailsContent } from "./MessageDetailsContent";

type MessageDetailsProps = {
  message: PNMessage;
  messageId: UIMessageId;
  service: ServicePublic | undefined;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
};

export const MessageDetails = ({ message, service }: MessageDetailsProps) => (
  <ScrollView>
    <MessageDetailHeader
      service={service}
      sender={message.senderDenomination}
      subject={message.subject}
      createdAt={message.created_at}
    />
    <MessageDetailsContent abstract={message.abstract} />
  </ScrollView>
);
