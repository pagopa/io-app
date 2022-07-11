import React, { useCallback, useState } from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { none, some } from "fp-ts/lib/Option";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { PNMessage } from "../store/types/types";
import customVariables from "../../../theme/variables";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { profileFiscalCodeSelector } from "../../../store/reducers/profile";
import {
  TransactionSummary,
  TransactionSummaryRow
} from "../../../screens/wallet/payment/components/TransactionSummary";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { paymentVerifica } from "../../../store/actions/wallet/payment";
import { getRptIdFromNoticeNumber } from "../../../utils/payment";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import ROUTES from "../../../navigation/routes";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { TransactionSummaryError } from "../../../screens/wallet/payment/NewTransactionSummaryScreen";
import { TransactionSummaryStatus } from "../../../screens/wallet/payment/components/TransactionSummaryStatus";
import { TransactionSummaryErrorDetails } from "../../../screens/wallet/payment/components/TransactionSummaryErrorDetails";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { PnMessageDetailsSection } from "./PnMessageDetailsSection";
import { PnMessageDetailsHeader } from "./PnMessageDetailsHeader";
import { PnMessageDetailsContent } from "./PnMessageDetailsContent";

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
    noticeNumber.isRight() && creditorTaxId.isRight()
      ? getRptIdFromNoticeNumber(
          creditorTaxId.value,
          noticeNumber.value
        ).toUndefined()
      : undefined;

  const paymentVerification = useIOSelector(
    state => state.wallet.payment.verifica
  );

  const paymentVerificationError: TransactionSummaryError = pot.isError(
    paymentVerification
  )
    ? some(paymentVerification.error)
    : none;

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
  }, [rptId, dispatch, setFirstLoadingRequest]);

  const startPayment = useCallback(() => {
    if (rptId) {
      navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
        screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
        rptId
      });
    }
  }, [rptId, navigation]);

  useOnFirstRender(verifyPaymentIfNeeded);

  return (
    <>
      {firstLoadingRequest && paymentVerificationError.isSome() && (
        <TransactionSummaryStatus error={paymentVerificationError} />
      )}
      <ScrollView style={{ padding: customVariables.contentPadding }}>
        {props.service && <PnMessageDetailsHeader service={props.service} />}
        <PnMessageDetailsContent
          style={styles.content}
          message={props.message}
        />
        {props.message.attachments && (
          <PnMessageDetailsSection
            title={I18n.t("features.pn.details.attachmentsSection.title")}
          />
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
                    paymentVerificationError.toUndefined() ===
                    "PAA_PAGAMENTO_DUPLICATO"
                  }
                />
                {paymentVerificationError.isSome() && (
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
            subtitle={props.message.iun}
            onPress={() => clipboardSetStringWithFeedback(props.message.iun)}
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
