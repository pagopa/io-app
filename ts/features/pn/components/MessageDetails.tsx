import { useNavigation } from "@react-navigation/native";
import React, { useCallback, createRef, useRef } from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as SEP from "fp-ts/lib/Separated";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  IOVisualCostants,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { H5 } from "../../../components/core/typography/H5";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { pnFrontendUrlSelector } from "../../../store/reducers/backendStatus";
import {
  UIAttachment,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { LegacyMessageAttachments } from "../../messages/components/LegacyMessageAttachments";
import PN_ROUTES from "../navigation/routes";
import { PNMessage } from "../store/types/types";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { trackPNAttachmentOpening } from "../analytics";
import { DSFullWidthComponent } from "../../design-system/components/DSFullWidthComponent";
import StatusContent from "../../../components/SectionStatus/StatusContent";
import {
  getStatusTextColor,
  statusColorMap,
  statusIconMap
} from "../../../components/SectionStatus";
import { LevelEnum } from "../../../../definitions/content/SectionStatus";
import { ATTACHMENT_CATEGORY } from "../../messages/types/attachmentCategory";
import { PnMessageDetailsContent } from "./PnMessageDetailsContent";
import { PnMessageDetailsHeader } from "./PnMessageDetailsHeader";
import { PnMessageDetailsSection } from "./PnMessageDetailsSection";
import { PnMessageTimeline } from "./PnMessageTimeline";
import { PnMessageTimelineCTA } from "./PnMessageTimelineCTA";
import { MessageF24 } from "./MessageF24";
import { MessagePayments } from "./MessagePayments";
import { MessageFooter } from "./MessageFooter";
import { MessagePaymentBottomSheet } from "./MessagePaymentBottomSheet";

type Props = Readonly<{
  messageId: UIMessageId;
  message: PNMessage;
  service: ServicePublic | undefined;
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined;
}>;

export const maxVisiblePaymentCountGenerator = () => 5;

export const MessageDetails = ({
  message,
  messageId,
  service,
  payments
}: Props) => {
  // console.log(`=== MessageDetails: rendering`);
  const navigation = useNavigation();
  const viewRef = createRef<View>();
  const presentPaymentsBottomSheetRef = useRef<() => void>();
  const dismissPaymentsBottomSheetRef = useRef<() => void>();
  const frontendUrl = useIOSelector(pnFrontendUrlSelector);

  const partitionedAttachments = pipe(
    message.attachments,
    O.fromNullable,
    O.getOrElse<ReadonlyArray<UIAttachment>>(() => []),
    RA.partition(attachment => attachment.category === ATTACHMENT_CATEGORY.F24)
  );

  const f24List = SEP.right(partitionedAttachments);
  const attachmentList = SEP.left(partitionedAttachments);

  const isCancelled = message.isCancelled ?? false;
  const completedPaymentNoticeCodes = isCancelled
    ? message.completedPayments
    : undefined;

  const openAttachment = useCallback(
    (attachment: UIAttachment) => {
      trackPNAttachmentOpening();
      navigation.navigate(PN_ROUTES.MESSAGE_ATTACHMENT, {
        messageId,
        attachmentId: attachment.id
      });
    },
    [messageId, navigation]
  );

  const maxVisiblePaymentCount = maxVisiblePaymentCountGenerator();
  const scrollViewRef = React.createRef<ScrollView>();
  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: IOVisualCostants.appMarginDefault
        }}
        ref={scrollViewRef}
      >
        {service && <PnMessageDetailsHeader service={service} />}
        <VSpacer />
        <PnMessageDetailsContent message={message} />
        {isCancelled && (
          <>
            <VSpacer />
            <DSFullWidthComponent>
              <StatusContent
                accessibilityLabel={I18n.t(
                  "features.pn.details.cancelledMessage.body"
                )}
                backgroundColor={statusColorMap.warning}
                foregroundColor={getStatusTextColor(LevelEnum.warning)}
                iconName={statusIconMap.warning}
                testID={"PnCancelledMessageBanner"}
                viewRef={viewRef}
              >
                {I18n.t("features.pn.details.cancelledMessage.body")}
              </StatusContent>
            </DSFullWidthComponent>
          </>
        )}

        {RA.isNonEmpty(attachmentList) && (
          <PnMessageDetailsSection
            title={I18n.t("features.pn.details.attachmentsSection.title")}
          >
            <LegacyMessageAttachments
              disabled={isCancelled}
              attachments={attachmentList}
              downloadAttachmentBeforePreview={true}
              openPreview={openAttachment}
            />
          </PnMessageDetailsSection>
        )}
        <MessagePayments
          messageId={messageId}
          isCancelled={isCancelled}
          payments={payments}
          completedPaymentNoticeCodes={completedPaymentNoticeCodes}
          maxVisiblePaymentCount={maxVisiblePaymentCount}
          presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
        />

        {RA.isNonEmpty(f24List) && (
          <>
            <MessageF24 attachments={f24List} />
            <VSpacer size={24} />
          </>
        )}

        <PnMessageDetailsSection
          title={I18n.t("features.pn.details.infoSection.title")}
        >
          <ListItemInfoCopy
            value={message.iun}
            onPress={() => clipboardSetStringWithFeedback(message.iun)}
            accessibilityLabel={I18n.t("features.pn.details.infoSection.iun")}
            label={I18n.t("features.pn.details.infoSection.iun")}
          />
          <H5 color="bluegrey">
            {I18n.t("features.pn.details.timeline.title")}
          </H5>
          <VSpacer size={24} />
          <PnMessageTimeline
            message={message}
            onExpand={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
          />
          {frontendUrl.length > 0 && <PnMessageTimelineCTA url={frontendUrl} />}
        </PnMessageDetailsSection>
      </ScrollView>

      {payments && (
        <MessagePaymentBottomSheet
          messageId={messageId}
          payments={payments}
          presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
          dismissPaymentsBottomSheetRef={dismissPaymentsBottomSheetRef}
        />
      )}

      <MessageFooter
        messageId={messageId}
        payments={payments}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
        isCancelled={isCancelled}
        presentPaymentsBottomSheetRef={presentPaymentsBottomSheetRef}
      />
    </>
  );
};
