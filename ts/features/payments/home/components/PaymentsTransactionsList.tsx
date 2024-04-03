import {
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { default as I18n } from "../../../../i18n";
import { fetchTransactionsRequestWithExpBackoff } from "../../../../store/actions/wallet/transactions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentUserWalletsSelector } from "../../checkout/store/selectors";
import {
  selectPaymentsTransactionSorted,
  selectPaymentsTransactions
} from "../store/selectors";
import { PaymentsListItemTransaction } from "./PaymentsListItemTransaction";

const PaymentsTransactionsList = () => {
  const dispatch = useIODispatch();

  const paymentMethodsPot = useIOSelector(walletPaymentUserWalletsSelector);
  const transactionsPot = useIOSelector(selectPaymentsTransactions);
  const sortedTransactions = useIOSelector(selectPaymentsTransactionSorted);

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(transactionsPot);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchTransactionsRequestWithExpBackoff({ start: 0 }));
    }, [dispatch])
  );

  const renderItems = () => {
    if (!isLoading) {
      return sortedTransactions.map(transaction => (
        <PaymentsListItemTransaction
          key={`transaction_${transaction.id}`}
          transaction={transaction}
        />
      ));
    }

    return Array.from({ length: 5 }).map((_, index) => (
      <ListItemTransaction
        isLoading={true}
        key={index}
        transactionStatus="success"
        transactionAmount=""
        title=""
        subtitle=""
      />
    ));
  };

  return (
    <>
      <ListItemHeader
        label={I18n.t("payment.homeScreen.historySection.header")}
        accessibilityLabel={I18n.t("payment.homeScreen.historySection.header")}
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("payment.homeScreen.historySection.headerCTA"),
            onPress: () => null
          }
        }}
      />
      {renderItems()}
    </>
  );
};

export { PaymentsTransactionsList };
