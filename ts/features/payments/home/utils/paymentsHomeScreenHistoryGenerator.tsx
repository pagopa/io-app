import { ListItemTransaction } from "@pagopa/io-app-design-system";
import * as _ from "lodash";
import * as React from "react";
import TypedI18n from "../../../../i18n";
import { IndexedById } from "../../../../store/helpers/indexer";
import { Transaction } from "../../../../types/pagopa";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { formatNumberCurrencyCents } from "../../../idpay/common/utils/strings";
import { isTransactionSuccess } from "../store/selectors";

export const getHistoryList = (history: IndexedById<Transaction>) => {
  const mapToItemProps = (transaction: Transaction) => {
    const recipient = transaction.merchant;

    const amountText = formatNumberCurrencyCents(transaction.amount.amount);
    const datetime: string = format(transaction.created, "DD MMM YYYY, HH:mm");

    const accessibleDatetime: string = format(
      transaction.created,
      "DD MMMM YYYY, HH:mm"
    );
    const accessibleAmountText = getAccessibleAmountText(amountText);
    const accessibilityLabel = `${recipient}; ${accessibleDatetime}; ${accessibleAmountText}`;

    const transactionStatus =
      isTransactionSuccess(transaction) === true ? "success" : "failure";

    const listItemProps: { key: number } & ListItemTransaction = {
      key: transaction.id,
      accessible: true,
      title: recipient,
      subtitle: datetime,
      onPress: undefined, // navigate to details
      transactionAmount: amountText,
      accessibilityLabel,
      badgeText: TypedI18n.t(
        `payment.homeScreen.historySection.transactionStatusBadges.${transactionStatus}`
      ),
      transactionStatus
    };
    return <ListItemTransaction {...listItemProps} />;
  };

  const toArray = _.values(history);
  const sortedByCreationDate = _.orderBy(toArray, item => item?.created, [
    "desc"
  ]);
  return sortedByCreationDate
    .filter((item): item is Transaction => item !== undefined)
    .map(mapToItemProps);
};
