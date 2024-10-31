import { Avatar, ListItemTransaction } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useMemo } from "react";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { getTransactionLogo } from "../../common/utils";
import { formatAmountText } from "../utils";
import I18n from "../../../../i18n";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";

type Props = {
  transaction: NoticeListItem;
  onPress?: () => void;
};

const PaymentsBizEventsListItemTransaction = React.memo(
  ({ transaction, onPress }: Props) => {
    const recipient = transaction.payeeName ?? "";

    const amountText = pipe(
      transaction.amount,
      O.fromNullable,
      O.map(amount => formatAmountText(amount)),
      O.getOrElse(() => "")
    );

    const datetime: string = pipe(
      transaction.noticeDate,
      O.fromNullable,
      O.map(transactionDate => format(transactionDate, "DD MMM YYYY, HH:mm")),
      O.getOrElse(() => "")
    );

    const accessibleDatetime: string = pipe(
      transaction.noticeDate,
      O.fromNullable,
      O.map(transactionDate => format(transactionDate, "DD MMMM YYYY, HH:mm")),
      O.getOrElse(() => "")
    );

    const transactionPayeeLogoUri = getTransactionLogo(transaction);

    const accessibleAmountText = getAccessibleAmountText(amountText);
    const accessibilityLabel = `${recipient}; ${accessibleDatetime}; ${accessibleAmountText}`;

    const TransactionEmptyIcon = useMemo(() => <Avatar size="small" />, []);

    const transactionLogo = pipe(
      transactionPayeeLogoUri,
      O.map(uri => ({ uri })),
      O.getOrElseW(() => TransactionEmptyIcon)
    );

    if (transaction.isCart) {
      return (
        <ListItemTransaction
          paymentLogoIcon={TransactionEmptyIcon}
          onPress={onPress}
          accessible={true}
          title={I18n.t("features.payments.transactions.multiplePayment")}
          subtitle={datetime}
          transactionAmount={amountText}
          accessibilityLabel={accessibilityLabel}
          transactionStatus="success"
        />
      );
    }

    return (
      <ListItemTransaction
        paymentLogoIcon={transactionLogo}
        onPress={onPress}
        accessible={true}
        title={recipient}
        subtitle={datetime}
        transactionAmount={amountText}
        accessibilityLabel={accessibilityLabel}
        transactionStatus="success"
      />
    );
  },
  (prevProps, nextProps) => prevProps.transaction === nextProps.transaction
);

export { PaymentsBizEventsListItemTransaction };
