import {
  ContentWrapper,
  Icon,
  Tag,
  VSpacer,
  useFooterActionsMeasurements,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as SEP from "fp-ts/lib/Separated";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useRef } from "react";
import { ScrollView } from "react-native";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { MessageDetailsAttachments } from "../../messages/components/MessageDetail/MessageDetailsAttachments";
import { MessageDetailsHeader } from "../../messages/components/MessageDetail/MessageDetailsHeader";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { PNMessage } from "../store/types/types";
import {
  maxVisiblePaymentCount,
  shouldUseBottomSheetForPayments
} from "../utils";
import { F24Section } from "./F24Section";
import { MessageBottomMenu } from "./MessageBottomMenu";
import { MessageCancelledContent } from "./MessageCancelledContent";
import { MessageFooter } from "./MessageFooter";
import { MessagePaymentBottomSheet } from "./MessagePaymentBottomSheet";
import { MessagePayments } from "./MessagePayments";
import { MessageDetailsContent } from "./MessageDetailsContent";

export type MessageDetailsProps = {
  message: PNMessage;
  messageId: string;
  serviceId: ServiceId;
  payments?: ReadonlyArray<NotificationPaymentInfo>;
  isAARMessage?: boolean;
};

export const MessageDetails = ({
  message,
  messageId,
  payments,
  serviceId,
  isAARMessage = false
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

  const maybeMessageDate = isAARMessage ? undefined : message.created_at;
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
            canNavigateToServiceDetails={!isAARMessage}
          >
            <Tag
              text={I18n.t("features.pn.details.badge.legalValue")}
              variant="legalMessage"
            />
            {attachmentList.length > 0 && (
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
          <MessageDetailsContent message={message} />
          <VSpacer size={16} />
          <MessageDetailsAttachments
            disabled={message.isCancelled}
            messageId={messageId}
            isPN
            serviceId={serviceId}
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
        onMeasure={handleFooterActionsMeasurements}
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
