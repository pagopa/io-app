import {
  ContentWrapper,
  Icon,
  Tag,
  VSpacer,
  useFooterActionsMeasurements,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useRef } from "react";
import { ScrollView } from "react-native";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { MessageDetailsAttachments } from "../../messages/components/MessageDetail/MessageDetailsAttachments";
import { MessageDetailsHeader } from "../../messages/components/MessageDetail/MessageDetailsHeader";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import {
  maxVisiblePaymentCount,
  openingSourceIsAarMessage,
  shouldUseBottomSheetForPayments
} from "../utils";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { IOReceivedNotification } from "../../../../definitions/pn/IOReceivedNotification";
import { BannerAttachments } from "./BannerAttachments";
import { F24Section } from "./F24Section";
import { MessageBottomMenu } from "./MessageBottomMenu";
import { MessageCancelledContent } from "./MessageCancelledContent";
import { MessageDetailsContent } from "./MessageDetailsContent";
import { MessageFooter } from "./MessageFooter";
import { MessagePaymentBottomSheet } from "./MessagePaymentBottomSheet";
import { MessagePayments } from "./MessagePayments";

export type MessageDetailsProps = {
  attachments: ReadonlyArray<ThirdPartyAttachment> | undefined;
  createdAt: Date | undefined;
  message: IOReceivedNotification;
  messageId: string;
  serviceId: ServiceId;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
};

export const MessageDetails = ({
  attachments,
  createdAt,
  message,
  messageId,
  payments,
  serviceId,
  sendOpeningSource,
  sendUserType
}: MessageDetailsProps) => {
  const presentPaymentsBottomSheetRef = useRef<() => void>(undefined);
  const theme = useIOTheme();
  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const hasStandardAttachments = attachments?.some(
    attachment =>
      attachment.category != null &&
      attachment.category !== ATTACHMENT_CATEGORY.F24
  );
  const isCancelled = message.isCancelled ?? false;
  const completedPaymentNoticeCodes = isCancelled
    ? message.completedPayments
    : undefined;

  const isAarMessage = openingSourceIsAarMessage(sendOpeningSource);
  const maybeMessageDate = isAarMessage ? undefined : createdAt;
  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
      >
        <ContentWrapper>
          <MessageDetailsHeader
            messageId={messageId}
            serviceId={serviceId}
            subject={message.subject}
            createdAt={maybeMessageDate}
            thirdPartySenderDenomination={message.senderDenomination}
            canNavigateToServiceDetails={!isAarMessage}
          >
            <Tag
              text={I18n.t("features.pn.details.badge.legalValue")}
              variant="legalMessage"
            />
            {hasStandardAttachments && (
              <Icon
                color={theme["icon-default"]}
                name="attachment"
                accessibilityLabel={I18n.t(
                  "messageDetails.accessibilityAttachmentIcon"
                )}
                testID="attachment-tag"
                size={16}
              />
            )}
          </MessageDetailsHeader>
          <MessageCancelledContent
            isCancelled={isCancelled}
            paidNoticeCodes={completedPaymentNoticeCodes}
            payments={payments}
          />
          <VSpacer size={16} />
          <MessageDetailsContent
            message={message}
            sendUserType={sendUserType}
          />
          <VSpacer size={16} />
          <MessageDetailsAttachments
            banner={<BannerAttachments />}
            disabled={message.isCancelled}
            messageId={messageId}
            serviceId={serviceId}
            sendOpeningSource={sendOpeningSource}
            sendUserType={sendUserType}
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
            sendOpeningSource={sendOpeningSource}
            sendUserType={sendUserType}
          />
          <VSpacer size={16} />
          <F24Section
            messageId={messageId}
            isCancelled={message.isCancelled}
            serviceId={serviceId}
            sendOpeningSource={sendOpeningSource}
            sendUserType={sendUserType}
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
          sendOpeningSource={sendOpeningSource}
          sendUserType={sendUserType}
        />
      </ScrollView>
      <MessageFooter
        messageId={messageId}
        payments={payments}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
        isCancelled={isCancelled}
        presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
        onMeasure={handleFooterActionsMeasurements}
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
      />
      {shouldUseBottomSheetForPayments(isCancelled, payments) && (
        <MessagePaymentBottomSheet
          messageId={messageId}
          payments={payments}
          presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
          serviceId={serviceId}
          sendOpeningSource={sendOpeningSource}
          sendUserType={sendUserType}
        />
      )}
    </>
  );
};
