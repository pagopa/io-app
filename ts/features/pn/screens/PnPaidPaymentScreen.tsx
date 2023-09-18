import * as React from "react";
import * as O from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { TransactionSummaryStatus } from "../../../screens/wallet/payment/components/TransactionSummaryStatus";
import { TransactionSummaryError } from "../../../screens/wallet/payment/NewTransactionSummaryScreen";
import { TransactionSummaryRow } from "../../../screens/wallet/payment/components/TransactionSummary";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { PnParamsList } from "../navigation/params";
import customVariables from "../../../theme/variables";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding
  }
});

export type PnPaidPaymentScreenNavigationParams = Readonly<{
  noticeCode: string;
  creditorTaxId?: string;
}>;

const paidPaymentError = O.some(
  "PPT_PAGAMENTO_DUPLICATO"
) as TransactionSummaryError;

export const PnPaidPaymentScreen = (
  props: IOStackNavigationRouteProps<
    PnParamsList,
    "PN_CANCELLED_MESSAGE_PAID_PAYMENT"
  >
): React.ReactElement => {
  const { noticeCode, creditorTaxId: maybeCreditorTaxId } = props.route.params;
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
          <TransactionSummaryRow
            axis={"horizontal"}
            title={I18n.t("payment.noticeCode")}
            subtitle={formattedPaymentNoticeNumber}
            onPress={() => clipboardSetStringWithFeedback(noticeCode)}
          />
          {maybeCreditorTaxId && (
            <TransactionSummaryRow
              axis={"horizontal"}
              title={I18n.t("wallet.firstTransactionSummary.entityCode")}
              subtitle={maybeCreditorTaxId}
              onPress={() => clipboardSetStringWithFeedback(maybeCreditorTaxId)}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
