import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { VSpacer } from "@pagopa/io-app-design-system";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { H5 } from "../../../components/core/typography/H5";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { TransactionSummaryRow } from "../../../screens/wallet/payment/components/TransactionSummary";
import { TransactionSummaryStatus } from "../../../screens/wallet/payment/components/TransactionSummaryStatus";
import { TransactionSummaryError } from "../../../screens/wallet/payment/NewTransactionSummaryScreen";
import { paymentVerifica } from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { pnFrontendUrlSelector } from "../../../store/reducers/backendStatus";
import {
  UIAttachment,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import customVariables from "../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { isDuplicatedPayment } from "../../../utils/payment";
import { MessageAttachments } from "../../messages/components/MessageAttachments";
import PN_ROUTES from "../navigation/routes";
import { NotificationPaymentInfo, PNMessage } from "../store/types/types";
import {
  trackPNAttachmentOpening,
  trackPNPaymentInfoError,
  trackPNPaymentInfoPaid,
  trackPNPaymentInfoPayable
} from "../analytics";
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
import { PnMessagePayment } from "./PnMessagePayment";

const styles = StyleSheet.create({
  content: {
    marginTop: customVariables.spacerHeight
  },
  spacer: { height: customVariables.spacerLargeHeight }
});

type Props = Readonly<{
  messageId: UIMessageId;
  message: PNMessage;
  service: ServicePublic | undefined;
  payment: NotificationPaymentInfo | undefined;
  rptId: RptId | undefined;
}>;

export const PnMessageDetails = ({
  message,
  messageId,
  service,
  payment,
  rptId
}: Props) => {
  const [firstLoadingRequest, setFirstLoadingRequest] = useState(false);
  const [shouldTrackMixpanel, setShouldTrackMixpanel] = useState(true);

  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const viewRef = createRef<View>();
  const frontendUrl = useIOSelector(pnFrontendUrlSelector);

  const isCancelled = message.isCancelled ?? false;
  const completedPaymentNoticeCode =
    isCancelled && message.completedPayments
      ? message.completedPayments[0]
      : undefined;

  const paymentVerification = useIOSelector(
    state => state.wallet.payment.verifica
  );

  const paymentVerificationError: TransactionSummaryError = pot.isError(
    paymentVerification
  )
    ? O.some(paymentVerification.error)
    : O.none;

  const verifyPaymentIfNeeded = useCallback(() => {
    if (!isCancelled && rptId) {
      dispatch(
        paymentVerifica.request({
          rptId,
          startOrigin: "message"
        })
      );
      setFirstLoadingRequest(true);
    }
  }, [isCancelled, rptId, dispatch]);

  const startPayment = useCallback(() => {
    if (!isCancelled && rptId) {
      navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
        screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
        params: { rptId }
      });
    }
  }, [isCancelled, rptId, navigation]);

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

  useOnFirstRender(verifyPaymentIfNeeded);

  const scrollViewRef = React.createRef<ScrollView>();

  const isVerifyingPayment = pot.isLoading(paymentVerification);
  const isPaid = isDuplicatedPayment(paymentVerificationError);

  useEffect(() => {
    if (!firstLoadingRequest || isVerifyingPayment || !shouldTrackMixpanel) {
      return;
    }

    if (isPaid) {
      trackPNPaymentInfoPaid();
    } else if (O.isSome(paymentVerificationError)) {
      trackPNPaymentInfoError(paymentVerificationError);
    } else if (!isCancelled) {
      trackPNPaymentInfoPayable();
    }
    setShouldTrackMixpanel(false);
  }, [
    firstLoadingRequest,
    isCancelled,
    isPaid,
    isVerifyingPayment,
    paymentVerificationError,
    shouldTrackMixpanel
  ]);

  return (
    <>
      {firstLoadingRequest && O.isSome(paymentVerificationError) && (
        <TransactionSummaryStatus error={paymentVerificationError} />
      )}
      <ScrollView
        style={{ padding: customVariables.contentPadding }}
        ref={scrollViewRef}
      >
        {service && <PnMessageDetailsHeader service={service} />}
        <PnMessageDetailsContent style={styles.content} message={message} />
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
        {message.attachments && (
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
        <PnMessagePayment
          messageId={messageId}
          firstLoadingRequest={firstLoadingRequest}
          isCancelled={isCancelled}
          isPaid={isPaid}
          payment={payment}
          paymentVerification={paymentVerification}
          paymentVerificationError={paymentVerificationError}
          completedPaymentNoticeCode={completedPaymentNoticeCode}
        />
        <PnMessageDetailsSection
          title={I18n.t("features.pn.details.infoSection.title")}
        >
          <TransactionSummaryRow
            axis="horizontal"
            title={I18n.t("features.pn.details.infoSection.iun")}
            hideSeparator={true}
            subtitle={message.iun}
            onPress={() => clipboardSetStringWithFeedback(message.iun)}
          />
          <H5
            color="bluegrey"
            style={{ marginBottom: customVariables.spacerLargeHeight }}
          >
            {I18n.t("features.pn.details.timeline.title")}
          </H5>
          <PnMessageTimeline
            message={message}
            onExpand={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
          />
          {frontendUrl.length > 0 && <PnMessageTimelineCTA url={frontendUrl} />}
        </PnMessageDetailsSection>
        <View style={styles.spacer} />
      </ScrollView>

      {firstLoadingRequest &&
        !isCancelled &&
        !pot.isLoading(paymentVerification) &&
        pot.isSome(paymentVerification) && (
          <FooterWithButtons
            type="SingleButton"
            leftButton={{
              block: true,
              onPress: startPayment,
              title: I18n.t("wallet.continue")
            }}
          />
        )}
    </>
  );
};
