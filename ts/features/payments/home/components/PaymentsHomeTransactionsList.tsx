import {
  IOStyles,
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import Animated, { Layout } from "react-native-reanimated";
import { default as I18n } from "../../../../i18n";
import { fetchTransactionsRequestWithExpBackoff } from "../../../../store/actions/wallet/transactions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  selectPaymentsTransactionSorted,
  selectPaymentsTransactions
} from "../store/selectors";
import { PaymentsListItemTransaction } from "./PaymentsListItemTransaction";

type Props = {
  enforcedLoadingState?: boolean;
};

const PaymentsHomeTransactionsList = ({ enforcedLoadingState }: Props) => {
  const dispatch = useIODispatch();

  const transactionsPot = useIOSelector(selectPaymentsTransactions);
  const sortedTransactions = useIOSelector(selectPaymentsTransactionSorted);

  const isLoading = pot.isLoading(transactionsPot) || enforcedLoadingState;

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

    return (
      <View testID="PaymentsHomeTransactionsListTestID-loading">
        {Array.from({ length: 5 }).map((_, index) => (
          <ListItemTransaction
            isLoading={true}
            key={index}
            transactionStatus="success"
            transactionAmount=""
            title=""
            subtitle=""
          />
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={IOStyles.flex}
      layout={Layout.duration(200)}
      testID="PaymentsHomeTransactionsListTestID"
    >
      <ListItemHeader
        label={I18n.t("features.payments.transactions.title")}
        accessibilityLabel={I18n.t("features.payments.transactions.title")}
      />
      {renderItems()}
    </Animated.View>
  );
};

export { PaymentsHomeTransactionsList };
