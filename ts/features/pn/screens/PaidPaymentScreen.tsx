import React from "react";
import * as O from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { ListItemInfoCopy } from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { TransactionSummaryStatus } from "../../../screens/wallet/payment/components/TransactionSummaryStatus";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import customVariables from "../../../theme/variables";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { TransactionSummaryError } from "../../../screens/wallet/payment/TransactionSummaryScreen";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding
  }
});

export type PaidPaymentScreenNavigationParams = Readonly<{
  noticeCode: string;
  creditorTaxId?: string;
}>;

const paidPaymentError = O.some(
  "PPT_PAGAMENTO_DUPLICATO"
) as TransactionSummaryError;

export const PaidPaymentScreen = (): React.ReactElement => {
  const { noticeCode, creditorTaxId: maybeCreditorTaxId } =
    useRoute<
      Route<
        "PN_CANCELLED_MESSAGE_PAID_PAYMENT",
        PaidPaymentScreenNavigationParams
      >
    >().params;
  const formattedPaymentNoticeNumber = noticeCode
    .replace(/(\d{4})/g, "$1  ")
    .trim();

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.ConfirmPayment.paymentInformations")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <TransactionSummaryStatus error={paidPaymentError} />
        <ScrollView style={styles.container}>
          <ListItemInfoCopy
            label={I18n.t("payment.noticeCode")}
            accessibilityLabel={I18n.t("payment.noticeCode")}
            value={formattedPaymentNoticeNumber}
            onPress={() => clipboardSetStringWithFeedback(noticeCode)}
          />
          {maybeCreditorTaxId && (
            <ListItemInfoCopy
              label={I18n.t("wallet.firstTransactionSummary.entityCode")}
              accessibilityLabel={I18n.t(
                "wallet.firstTransactionSummary.entityCode"
              )}
              value={maybeCreditorTaxId}
              onPress={() => clipboardSetStringWithFeedback(maybeCreditorTaxId)}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
