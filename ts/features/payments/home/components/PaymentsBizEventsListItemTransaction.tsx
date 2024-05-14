import {
  Avatar,
  Icon,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { TransactionListItem } from "../../../../../definitions/pagopa/biz-events/TransactionListItem";
import { getTransactionLogo } from "../../common/utils";

type Props = {
  transaction: TransactionListItem;
};

const PaymentsBizEventsListItemTransaction = ({ transaction }: Props) => {
  const recipient = pipe(
    transaction.payeeName,
    O.fromNullable,
    O.getOrElse(() => "")
  );

  const amountText = pipe(
    transaction.amount,
    O.fromNullable,
    O.map(amount => `${amount} €`),
    O.getOrElse(() => "")
  );
  const datetime: string = pipe(
    transaction.transactionDate,
    O.fromNullable,
    O.map(transactionDate => format(transactionDate, "DD MMM YYYY, HH:mm")),
    O.getOrElse(() => "")
  );

  const accessibleDatetime: string = pipe(
    transaction.transactionDate,
    O.fromNullable,
    O.map(transactionDate => format(transactionDate, "DD MMMM YYYY, HH:mm")),
    O.getOrElse(() => "")
  );

  const transactionPayeeLogoUri = getTransactionLogo(transaction);

  const accessibleAmountText = getAccessibleAmountText(amountText);
  const accessibilityLabel = `${recipient}; ${accessibleDatetime}; ${accessibleAmountText}`;

  const TransactionFallbackIcon = () => <Avatar size="small" />;

  const transactionLogo = pipe(
    transactionPayeeLogoUri,
    O.map(uri => ({ uri })),
    O.getOrElseW(() => <TransactionFallbackIcon />)
  );

  return (
    <ListItemTransaction
      paymentLogoIcon={transactionLogo}
      accessible={true}
      title={recipient}
      subtitle={datetime}
      transactionAmount={amountText}
      accessibilityLabel={accessibilityLabel}
      transactionStatus="success"
    />
  );
};

export { PaymentsBizEventsListItemTransaction };
