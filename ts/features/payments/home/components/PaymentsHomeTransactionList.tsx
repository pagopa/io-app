import {
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as _ from "lodash";
import * as React from "react";
import { default as I18n } from "../../../../i18n";
import { fetchTransactionsRequestWithExpBackoff } from "../../../../store/actions/wallet/transactions";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { GlobalState } from "../../../../store/reducers/types";
import { Transaction } from "../../../../types/pagopa";
import { PaymentsHomeListItemTransaction } from "./PaymentsHomeListItemTransaction";

const PaymentsHomeTransactionList = () => {
  const dispatch = useIODispatch();

  const transactionsPot = useIOSelector(
    (state: GlobalState) => state.wallet.transactions.transactions
  );

  const isLoading = pot.isLoading(transactionsPot);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchTransactionsRequestWithExpBackoff({ start: 0 }));
    }, [dispatch])
  );

  const renderItems = () => {
    if (!isLoading && pot.isSome(transactionsPot)) {
      const toArray = _.values(transactionsPot.value);
      const sortedByCreationDate = _.orderBy(toArray, item => item?.created, [
        "desc"
      ]);

      return sortedByCreationDate
        .filter((item): item is Transaction => item !== undefined)
        .map(transaction => (
          <PaymentsHomeListItemTransaction
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
    // full pages history loading will be handled by history details page
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

export { PaymentsHomeTransactionList };
