import { ListItemTransaction } from "@pagopa/io-app-design-system";
import React from "react";
import I18n from "../../../../i18n";
import { Transaction, isSuccessTransaction } from "../../../../types/pagopa";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { formatNumberCurrencyCents } from "../../../idpay/common/utils/strings";

type Props = {
  transaction: Transaction;
};

const PaymentsHomeListItemTransaction = ({ transaction }: Props) => {
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
    isSuccessTransaction(transaction) === true ? "success" : "failure";

  return (
    <ListItemTransaction
      accessible={true}
      title={recipient}
      subtitle={datetime}
      transactionAmount={amountText}
      accessibilityLabel={accessibilityLabel}
      badgeText={I18n.t(
        `payment.homeScreen.historySection.transactionStatusBadges.${transactionStatus}`
      )}
      transactionStatus={transactionStatus}
    />
  );
};

export { PaymentsHomeListItemTransaction };
