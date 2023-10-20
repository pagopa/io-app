import { useNavigation } from "@react-navigation/native";
import React, { createRef, useCallback } from "react";
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
import { MessageAttachments } from "../../messages/components/MessageAttachments";
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
import { PnMessageDetailsContent } from "./PnMessageDetailsContent";
import { PnMessageDetailsHeader } from "./PnMessageDetailsHeader";
import { PnMessageDetailsSection } from "./PnMessageDetailsSection";
import { PnMessageTimeline } from "./PnMessageTimeline";
import { PnMessageTimelineCTA } from "./PnMessageTimelineCTA";
import { MessagePayments } from "./MessagePayments";
import { MessageFooter } from "./MessageFooter";

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
  const navigation = useNavigation();
  const viewRef = createRef<View>();
  const frontendUrl = useIOSelector(pnFrontendUrlSelector);

  const hasAttachment = message.attachments && message.attachments.length > 0;
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
  // console.log(`=== MessageDetails: re-rendering`);
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
        {hasAttachment && (
          <PnMessageDetailsSection
            title={I18n.t("features.pn.details.attachmentsSection.title")}
          >
            <MessageAttachments
              attachments={message.attachments}
              openPreview={openAttachment}
              disabled={isCancelled}
            />
          </PnMessageDetailsSection>
        )}
        <MessagePayments
          messageId={messageId}
          isCancelled={isCancelled}
          payments={payments}
          completedPaymentNoticeCodes={completedPaymentNoticeCodes}
          maxVisiblePaymentCount={maxVisiblePaymentCount}
        />
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

      <MessageFooter
        messageId={messageId}
        payments={payments}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
      />
    </>
  );
};
