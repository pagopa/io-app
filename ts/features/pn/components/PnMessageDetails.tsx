import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as AR from "fp-ts/lib/Array";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { H5 } from "../../../components/core/typography/H5";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import ROUTES from "../../../navigation/routes";
import {
  TransactionSummary,
  TransactionSummaryRow
} from "../../../screens/wallet/payment/components/TransactionSummary";
import { TransactionSummaryErrorDetails } from "../../../screens/wallet/payment/components/TransactionSummaryErrorDetails";
import { TransactionSummaryStatus } from "../../../screens/wallet/payment/components/TransactionSummaryStatus";
import { TransactionSummaryError } from "../../../screens/wallet/payment/NewTransactionSummaryScreen";
import { paymentVerifica } from "../../../store/actions/wallet/payment";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { PnConfigSelector } from "../../../store/reducers/backendStatus";
import {
  UIAttachment,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import { profileFiscalCodeSelector } from "../../../store/reducers/profile";
import customVariables from "../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { isDuplicatedPayment } from "../../../utils/payment";
import { MessageAttachments } from "../../messages/components/MessageAttachments";
import PN_ROUTES from "../navigation/routes";
import { PNMessage } from "../store/types/types";
import { getRptIdFromPayment } from "../utils/rptId";
import { PnMessageDetailsContent } from "./PnMessageDetailsContent";
import { PnMessageDetailsHeader } from "./PnMessageDetailsHeader";
import { PnMessageDetailsSection } from "./PnMessageDetailsSection";
import { PnMessageTimeline } from "./PnMessageTimeline";
import { PnMessageTimelineCTA } from "./PnMessageTimelineCTA";

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
}>;

export const PnMessageDetails = (props: Props) => {
  const [firstLoadingRequest, setFirstLoadingRequest] = useState(false);
  const [shouldTrackMixpanel, setShouldTrackMixpanel] = useState(true);

  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);
  const frontendUrl = useIOSelector(PnConfigSelector).frontend_url;

  const maybePayment = pipe(
    props.message.recipients,
    AR.findFirst(_ => _.taxId === currentFiscalCode),
    O.chainNullableK(_ => _.payment),
    O.getOrElseW(() => undefined)
  );
  const rptId = getRptIdFromPayment(maybePayment);

  const paymentVerification = useIOSelector(
    state => state.wallet.payment.verifica
  );

  const paymentVerificationError: TransactionSummaryError = pot.isError(
    paymentVerification
  )
    ? O.some(paymentVerification.error)
    : O.none;

  const verifyPaymentIfNeeded = useCallback(() => {
    if (rptId) {
      dispatch(
        paymentVerifica.request({
          rptId,
          startOrigin: "message"
        })
      );
      setFirstLoadingRequest(true);
    }
  }, [rptId, dispatch]);

  const startPayment = useCallback(() => {
    if (rptId) {
      navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
        screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
        params: { rptId }
      });
    }
  }, [rptId, navigation]);

  const messageId = props.messageId;
  const openAttachment = useCallback(
    (attachment: UIAttachment) => {
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
      void mixpanelTrack("PN_PAYMENTINFO_PAID");
    } else if (O.isSome(paymentVerificationError)) {
      void mixpanelTrack("PN_PAYMENTINFO_ERROR", {
        paymentStatus: pipe(
          paymentVerificationError,
          O.getOrElseW(() => undefined)
        )
      });
    } else {
      void mixpanelTrack("PN_PAYMENTINFO_PAYABLE");
    }
    setShouldTrackMixpanel(false);
  }, [
    firstLoadingRequest,
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
        {props.service && <PnMessageDetailsHeader service={props.service} />}
        <PnMessageDetailsContent
          style={styles.content}
          message={props.message}
        />
        {props.message.attachments && (
          <PnMessageDetailsSection
            title={I18n.t("features.pn.details.attachmentsSection.title")}
          >
            <MessageAttachments
              attachments={props.message.attachments}
              openPreview={openAttachment}
            />
          </PnMessageDetailsSection>
        )}
        {maybePayment && (
          <PnMessageDetailsSection
            title={I18n.t("features.pn.details.paymentSection.title")}
          >
            {firstLoadingRequest && (
              <>
                <TransactionSummary
                  paymentVerification={paymentVerification}
                  paymentNoticeNumber={maybePayment.noticeCode}
                  organizationFiscalCode={maybePayment.creditorTaxId}
                  isPaid={isPaid}
                />
                {O.isSome(paymentVerificationError) && (
                  <TransactionSummaryErrorDetails
                    error={paymentVerificationError}
                    paymentNoticeNumber={maybePayment.noticeCode}
                    organizationFiscalCode={maybePayment.creditorTaxId}
                    messageId={props.messageId}
                  />
                )}
              </>
            )}
          </PnMessageDetailsSection>
        )}
        <PnMessageDetailsSection
          title={I18n.t("features.pn.details.infoSection.title")}
        >
          <TransactionSummaryRow
            axis="horizontal"
            title={I18n.t("features.pn.details.infoSection.iun")}
            hideSeparator={true}
            subtitle={props.message.iun}
            onPress={() => clipboardSetStringWithFeedback(props.message.iun)}
          />
          <H5
            color="bluegrey"
            style={{ marginBottom: customVariables.spacerLargeHeight }}
          >
            {I18n.t("features.pn.details.timeline.title")}
          </H5>
          <PnMessageTimeline
            message={props.message}
            onExpand={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          />
          {frontendUrl.length > 0 && <PnMessageTimelineCTA url={frontendUrl} />}
        </PnMessageDetailsSection>
        <View style={styles.spacer} />
      </ScrollView>

      {firstLoadingRequest &&
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
