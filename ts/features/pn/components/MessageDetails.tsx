import { useRef } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as SEP from "fp-ts/lib/Separated";
import {
  ContentWrapper,
  IOStyles,
  Icon,
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
import {
  maxVisiblePaymentCountGenerator,
  shouldUseBottomSheetForPayments
} from "../utils";
import { MessageDetailsContent } from "./MessageDetailsContent";
import { F24Section } from "./F24Section";
import { MessageBottomMenu } from "./MessageBottomMenu";
import { MessagePayments } from "./MessagePayments";
import { MessagePaymentBottomSheet } from "./MessagePaymentBottomSheet";
import { MessageFooter } from "./MessageFooter";
import { MessageCancelledContent } from "./MessageCancelledContent";

type MessageDetailsProps = {
  message: PNMessage;
  messageId: UIMessageId;
  serviceId: ServiceId;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
};

export const MessageDetails = ({
  message,
  messageId,
  payments,
  serviceId
}: MessageDetailsProps) => {
  const presentPaymentsBottomSheetRef = useRef<() => void>();
  const safeAreaInsets = useSafeAreaInsets();
  const partitionedAttachments = pipe(
    message.attachments,
    O.fromNullable,
    O.getOrElse<ReadonlyArray<ThirdPartyAttachment>>(() => []),
    RA.partition(attachment => attachment.category === ATTACHMENT_CATEGORY.F24)
  );

  const attachmentList = SEP.left(partitionedAttachments);
  const maxVisiblePaymentCount = maxVisiblePaymentCountGenerator();

  const isCancelled = message.isCancelled ?? false;
  const completedPaymentNoticeCodes = isCancelled
    ? message.completedPayments
    : undefined;

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: IOStyles.footer.paddingBottom + safeAreaInsets.bottom
        }}
      >
        <ContentWrapper>
          <MessageDetailsHeader
            messageId={messageId}
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
                <Icon
                  name="attachment"
                  accessibilityLabel={I18n.t(
                    "messageDetails.accessibilityAttachmentIcon"
                  )}
                  testID="attachment-tag"
                  size={16}
                />
              </MessageDetailsTagBox>
            )}
            <VSpacer size={8} />
          </MessageDetailsHeader>
          <MessageCancelledContent
            isCancelled={isCancelled}
            paidNoticeCodes={completedPaymentNoticeCodes}
            payments={payments}
          />
          <MessageDetailsContent abstract={message.abstract} />
          <VSpacer size={16} />
          <MessageDetailsAttachments
            disabled={message.isCancelled}
            messageId={messageId}
            isPN
          />
          <VSpacer size={16} />
          <MessagePayments
            messageId={messageId}
            isCancelled={isCancelled}
            payments={payments}
            completedPaymentNoticeCodes={completedPaymentNoticeCodes}
            maxVisiblePaymentCount={maxVisiblePaymentCount}
            presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
            serviceId={serviceId}
          />
          <VSpacer size={16} />
          <F24Section
            messageId={messageId}
            isCancelled={message.isCancelled}
            serviceId={serviceId}
          />
          <VSpacer size={16} />
        </ContentWrapper>
        <MessageBottomMenu
          history={message.notificationStatusHistory}
          isCancelled={message.isCancelled}
          iun={message.iun}
          messageId={messageId}
          paidNoticeCodes={completedPaymentNoticeCodes}
          payments={payments}
          serviceId={serviceId}
        />
      </ScrollView>
      <MessageFooter
        messageId={messageId}
        serviceId={serviceId}
        payments={payments}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
        isCancelled={isCancelled}
        presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
      />
      {shouldUseBottomSheetForPayments(isCancelled, payments) && (
        <MessagePaymentBottomSheet
          messageId={messageId}
          payments={payments}
          presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
          serviceId={serviceId}
        />
      )}
    </>
  );
};
