import React from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as SEP from "fp-ts/lib/Separated";
import {
  ContentWrapper,
  IOStyles,
  Tag,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import I18n from "../../../i18n";
import { PNMessage } from "../store/types/types";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { MessageDetailsHeader } from "../../messages/components/MessageDetail/MessageDetailsHeader";
import { MessageDetailsTagBox } from "../../messages/components/MessageDetail/MessageDetailsTagBox";
import { MessageDetailsAttachments } from "../../messages/components/MessageDetail/MessageDetailsAttachments";
import { UIMessageId } from "../../messages/types";
import { MessageDetailsContent } from "./MessageDetailsContent";

type MessageDetailsProps = {
  message: PNMessage;
  messageId: UIMessageId;
  serviceId: ServiceId;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
};

export const MessageDetails = ({
  message,
  messageId,
  serviceId
}: MessageDetailsProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const partitionedAttachments = pipe(
    message.attachments,
    O.fromNullable,
    O.getOrElse<ReadonlyArray<ThirdPartyAttachment>>(() => []),
    RA.partition(attachment => attachment.category === ATTACHMENT_CATEGORY.F24)
  );

  const attachmentList = SEP.left(partitionedAttachments);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: IOStyles.footer.paddingBottom + safeAreaInsets.bottom
      }}
    >
      <ContentWrapper>
        <MessageDetailsHeader
          serviceId={serviceId}
          subject={message.subject}
          createdAt={message.created_at}
        >
          <MessageDetailsTagBox>
            <Tag
              text={I18n.t("features.pn.details.badge.legalValue")}
              variant="legalMessage"
            />
          </MessageDetailsTagBox>
          {attachmentList.length > 0 && (
            <MessageDetailsTagBox>
              <Tag
                variant="attachment"
                testID="attachment-tag"
                iconAccessibilityLabel={I18n.t(
                  "messageDetails.accessibilityAttachmentIcon"
                )}
              />
            </MessageDetailsTagBox>
          )}
          <VSpacer size={8} />
        </MessageDetailsHeader>
        <MessageDetailsContent abstract={message.abstract} />
        <VSpacer />
        <MessageDetailsAttachments
          disabled={message.isCancelled}
          messageId={messageId}
          removeF24
        />
      </ContentWrapper>
    </ScrollView>
  );
};
