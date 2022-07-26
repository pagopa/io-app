import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
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
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { profileFiscalCodeSelector } from "../../../store/reducers/profile";
import customVariables from "../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { getRptIdFromNoticeNumber } from "../../../utils/payment";
import { MvlAttachments } from "../../mvl/screens/details/components/attachment/MvlAttachments";
import { MvlAttachmentId } from "../../mvl/types/mvlData";
import { H5 } from "../../../components/core/typography/H5";
import { PnMessageDetailsSection } from "./PnMessageDetailsSection";
import { PnMessageDetailsHeader } from "./PnMessageDetailsHeader";
import { PnMessageDetailsContent } from "./PnMessageDetailsContent";
import { PnMessageTimeline } from "./PnMessageTimeline";

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

  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const currentFiscalCode = useIOSelector(profileFiscalCodeSelector);

  const maybePayment = props.message.recipients.find(
    _ => _.taxId === currentFiscalCode
  )?.payment;

  const noticeNumber = PaymentNoticeNumber.decode(maybePayment?.noticeCode);
  const creditorTaxId = OrganizationFiscalCode.decode(
    maybePayment?.creditorTaxId
  );

  const rptId =
    E.isRight(noticeNumber) && E.isRight(creditorTaxId)
      ? O.toUndefined(
          getRptIdFromNoticeNumber(creditorTaxId.right, noticeNumber.right)
        )
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
        rptId
      });
    }
  }, [rptId, navigation]);

  const openAttachment = useCallback(
    (attachmentId: MvlAttachmentId) => {
      navigation.navigate(PN_ROUTES.MESSAGE_ATTACHMENT, { attachmentId });
    },
    [navigation]
  );

  useOnFirstRender(verifyPaymentIfNeeded);

  const scrollViewRef = React.createRef<ScrollView>();

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
            <MvlAttachments
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
                  isPaid={
                    O.toUndefined(paymentVerificationError) ===
                    "PAA_PAGAMENTO_DUPLICATO"
                  }
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
