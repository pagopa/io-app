import { useRef } from "react";
import { ScrollView } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as SEP from "fp-ts/lib/Separated";
import {
  ContentWrapper,
  Icon,
  Tag,
  VSpacer,
  useFooterActionsMeasurements,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { PNMessage } from "../store/types/types";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { MessageDetailsHeader } from "../../messages/components/MessageDetail/MessageDetailsHeader";
import { MessageDetailsAttachments } from "../../messages/components/MessageDetail/MessageDetailsAttachments";
import {
  maxVisiblePaymentCount,
  shouldUseBottomSheetForPayments
} from "../utils";
import { MessageDetailsContent } from "./MessageDetailsContent";
import { F24Section } from "./F24Section";
import { MessageBottomMenu } from "./MessageBottomMenu";
import { MessagePayments } from "./MessagePayments";
import { MessagePaymentBottomSheet } from "./MessagePaymentBottomSheet";
import { MessageFooter } from "./MessageFooter";
import { MessageCancelledContent } from "./MessageCancelledContent";

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
          <MessageDetailsContent abstract={message.abstract} />
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
