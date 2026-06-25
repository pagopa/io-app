import {
  ContentWrapper,
  Icon,
  Tag,
  useFooterActionsMeasurements,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as SEP from "fp-ts/lib/Separated";
import I18n from "i18next";
import { useRef } from "react";
import { ScrollView } from "react-native";

import { ThirdPartyAttachment } from "../../../../definitions/communication/ThirdPartyAttachment";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import { MessageDetailsAttachments } from "../../messages/components/MessageDetail/MessageDetailsAttachments";
import { MessageDetailsHeader } from "../../messages/components/MessageDetail/MessageDetailsHeader";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { PNMessage } from "../store/types/types";
import {
  maxVisiblePaymentCount,
  openingSourceIsAarMessage,
  shouldUseBottomSheetForPayments
} from "../utils";
import { BannerAttachments } from "./BannerAttachments";
import { F24Section } from "./F24Section";
import { MessageBottomMenu } from "./MessageBottomMenu";
import { MessageCancelledContent } from "./MessageCancelledContent";
import { MessageDetailsContent } from "./MessageDetailsContent";
import { MessageFooter } from "./MessageFooter";
import { MessagePaymentBottomSheet } from "./MessagePaymentBottomSheet";
import { MessagePayments } from "./MessagePayments";

export type MessageDetailsProps = {
  message: PNMessage;
  messageId: string;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
  sendOpeningSource: SendOpeningSource;
  sendUserType: SendUserType;
  serviceId: ServiceId;
};

export const MessageDetails = ({
  message,
  messageId,
  payments,
  serviceId,
  sendOpeningSource,
  sendUserType
}: MessageDetailsProps) => {
  const presentPaymentsBottomSheetRef = useRef<() => void>(undefined);
  const partitionedAttachments = pipe(
    message.attachments,
    O.fromNullable,
    O.getOrElse<ReadonlyArray<ThirdPartyAttachment>>(() => []),
    RA.partition(attachment => attachment.category === ATTACHMENT_CATEGORY.F24)
  );

  const theme = useIOTheme();

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const attachmentList = SEP.left(partitionedAttachments);

  const isCancelled = message.isCancelled ?? false;
  const completedPaymentNoticeCodes = isCancelled
    ? message.completedPayments
    : undefined;

  const isAarMessage = openingSourceIsAarMessage(sendOpeningSource);
  const maybeMessageDate = isAarMessage ? undefined : message.created_at;
  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
      >
        <ContentWrapper>
          <MessageDetailsHeader
            canNavigateToServiceDetails={!isAarMessage}
            createdAt={maybeMessageDate}
            messageId={messageId}
            serviceId={serviceId}
            subject={message.subject}
            thirdPartySenderDenomination={message.senderDenomination}
          >
            <Tag
              text={I18n.t("features.pn.details.badge.legalValue")}
              variant="legalMessage"
            />
            {attachmentList.length > 0 && (
              <Icon
                accessibilityLabel={I18n.t(
                  "messageDetails.accessibilityAttachmentIcon"
                )}
                color={theme["icon-default"]}
                name="attachment"
                size={16}
                testID="attachment-tag"
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
            sendOpeningSource={sendOpeningSource}
            sendUserType={sendUserType}
            serviceId={serviceId}
          />
          <VSpacer size={16} />
          <MessagePayments
            completedPaymentNoticeCodes={completedPaymentNoticeCodes}
            isCancelled={isCancelled}
            maxVisiblePaymentCount={maxVisiblePaymentCount}
            messageId={messageId}
            payments={payments}
            presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
            sendOpeningSource={sendOpeningSource}
            sendUserType={sendUserType}
            serviceId={serviceId}
          />
          <VSpacer size={16} />
          <F24Section
            isCancelled={message.isCancelled}
            messageId={messageId}
            sendOpeningSource={sendOpeningSource}
            sendUserType={sendUserType}
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
          sendOpeningSource={sendOpeningSource}
          sendUserType={sendUserType}
        />
      </ScrollView>
      <MessageFooter
        isCancelled={isCancelled}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
        messageId={messageId}
        onMeasure={handleFooterActionsMeasurements}
        payments={payments}
        presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
      />
      {shouldUseBottomSheetForPayments(isCancelled, payments) && (
        <MessagePaymentBottomSheet
          messageId={messageId}
          payments={payments}
          presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
          sendOpeningSource={sendOpeningSource}
          sendUserType={sendUserType}
          serviceId={serviceId}
        />
      )}
    </>
  );
};
