import React from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as SEP from "fp-ts/lib/Separated";
import { HSpacer, IOStyles, Tag, VSpacer } from "@pagopa/io-app-design-system";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { UIAttachment, UIMessageId } from "../../messages/types";
import { PNMessage } from "../store/types/types";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { MessageDetailHeader } from "../../messages/components/MessageDetail/MessageDetailHeader";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import I18n from "../../../i18n";
import { MessageDetailsContent } from "./MessageDetailsContent";

type MessageDetailsProps = {
  message: PNMessage;
  messageId: UIMessageId;
  service: ServicePublic | undefined;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
};

export const MessageDetails = ({ message, service }: MessageDetailsProps) => {
  const partitionedAttachments = pipe(
    message.attachments,
    O.fromNullable,
    O.getOrElse<ReadonlyArray<UIAttachment>>(() => []),
    RA.partition(attachment => attachment.category === ATTACHMENT_CATEGORY.F24)
  );

  const attachmentList = SEP.left(partitionedAttachments);

  return (
    <ScrollView>
      <MessageDetailHeader
        service={service}
        sender={message.senderDenomination}
        subject={message.subject}
        createdAt={message.created_at}
      >
        <View style={IOStyles.row}>
          <Tag
            text={I18n.t("features.pn.details.badge.legalValue")}
            variant="legalMessage"
          />
          {attachmentList.length > 0 ? (
            <>
              <HSpacer size={8} />
              <Tag variant="attachment" testID="attachment-tag" />
            </>
          ) : null}
        </View>
        <VSpacer size={8} />
      </MessageDetailHeader>
      <MessageDetailsContent abstract={message.abstract} />
    </ScrollView>
  );
};
