import { ListItemTransaction } from "@pagopa/io-app-design-system";
import React from "react";
import { Transaction, isSuccessTransaction } from "../../../../types/pagopa";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { formatNumberCurrencyCents } from "../../../idpay/common/utils/strings";
import { getBadgeTextAndVariantByTransactionStatus } from "../../common/utils";

type Props = {
  transaction: Transaction;
  onPressTransaction: () => void;
};

const PaymentsLegacyListItemTransaction = ({
  transaction,
  onPressTransaction
}: Props) => {
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

  if (transactionStatus === "failure") {
    return (
      <ListItemTransaction
        accessible={true}
        title={recipient}
        subtitle={datetime}
        transaction={{
          badge: getBadgeTextAndVariantByTransactionStatus(transactionStatus)
        }}
        onPress={onPressTransaction}
      />
    );
  }

  return (
    <ListItemTransaction
      accessible={true}
      title={recipient}
      subtitle={datetime}
      transaction={{
        amount: amountText,
        amountAccessibilityLabel: accessibilityLabel
      }}
      onPress={onPressTransaction}
    />
  );
};

export { PaymentsLegacyListItemTransaction };
