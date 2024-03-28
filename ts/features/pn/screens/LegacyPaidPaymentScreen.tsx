import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { ListItemInfoCopy } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { TransactionSummaryStatus } from "../../../screens/wallet/payment/components/TransactionSummaryStatus";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { TransactionSummaryError } from "../../../screens/wallet/payment/TransactionSummaryScreen";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { PnParamsList } from "../navigation/params";

type LegacyPaidPaymentScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  "PN_CANCELLED_MESSAGE_PAID_PAYMENT"
>;

const paidPaymentError = O.some(
  "PPT_PAGAMENTO_DUPLICATO"
) as TransactionSummaryError;

export const LegacyPaidPaymentScreen = ({
  route
}: LegacyPaidPaymentScreenProps) => {
  const { noticeCode, creditorTaxId } = route.params;
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
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <ListItemInfoCopy
            label={I18n.t("payment.noticeCode")}
            accessibilityLabel={I18n.t("payment.noticeCode")}
            value={formattedPaymentNoticeNumber}
            onPress={() => clipboardSetStringWithFeedback(noticeCode)}
          />
          {creditorTaxId && (
            <ListItemInfoCopy
              label={I18n.t("wallet.firstTransactionSummary.entityCode")}
              accessibilityLabel={I18n.t(
                "wallet.firstTransactionSummary.entityCode"
              )}
              value={creditorTaxId}
              onPress={() => clipboardSetStringWithFeedback(creditorTaxId)}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
