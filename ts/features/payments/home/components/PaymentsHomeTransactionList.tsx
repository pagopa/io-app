import {
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as _ from "lodash";
import * as React from "react";
import { default as I18n } from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { Transaction } from "../../../../types/pagopa";
import { walletTransactionHistorySelector } from "../store/selectors";
import { PaymentsHomeListItemTransaction } from "./PaymentsHomeListItemTransaction";

const PaymentsHomeTransactionList = () => {
  const historyPot = useIOSelector(walletTransactionHistorySelector);

  const renderItems = () => {
    if (pot.isLoading(historyPot)) {
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
    }

    const toArray = _.values(history);
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
