import { Avatar, ListItemTransaction } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { memo, useMemo } from "react";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { getTransactionLogo } from "../../common/utils";
import { formatAmountText } from "../utils";
import I18n from "../../../../i18n";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { hidePaymentsReceiptAction } from "../store/actions";
import { useIODispatch } from "../../../../store/hooks";
import { withSwipeAction } from "../../../../components/ListItemSwipeAction";

type Props = {
  transaction: NoticeListItem;
  onPress?: () => void;
};

const ReceiptListItemTransaction = memo(
  ({ transaction, onPress }: Props) => {
    const recipient = transaction.isCart
      ? I18n.t("features.payments.transactions.multiplePayment")
      : transaction.payeeName ?? "";

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

    const accessibleAmountText = getAccessibleAmountText(amountText) ?? "";
    const accessibilityLabel = `${recipient}; ${accessibleDatetime}; ${accessibleAmountText}`;

    const TransactionEmptyIcon = useMemo(() => <Avatar size="small" />, []);

    const transactionLogo = pipe(
      transactionPayeeLogoUri,
      O.map(uri => ({ uri })),
      O.getOrElseW(() => TransactionEmptyIcon)
    );

    const dispatch = useIODispatch();

    const swipeActionProps = {
      accessibilityLabel: I18n.t(
        "features.payments.transactions.receipt.hideFromList"
      ),
      swipeAction: () => {
        dispatch(
          hidePaymentsReceiptAction.request({
            transactionId: transaction.eventId
          })
        );
      },
      alertProps: {
        title: I18n.t(
          "features.payments.transactions.receipt.hideBanner.title"
        ),
        message: I18n.t(
          "features.payments.transactions.receipt.hideBanner.content"
        ),
        confirmText: I18n.t(
          "features.payments.transactions.receipt.hideBanner.accept"
        ),
        cancelText: I18n.t("global.buttons.cancel")
      }
    };

    const SwipableListItemTransaction = withSwipeAction(ListItemTransaction);

    if (transaction.isCart) {
      return (
        <SwipableListItemTransaction
          {...swipeActionProps}
          paymentLogoIcon={TransactionEmptyIcon}
          onPress={onPress}
          accessible
          accessibilityLabel={accessibilityLabel}
          title={I18n.t("features.payments.transactions.multiplePayment")}
          subtitle={datetime}
          transaction={{
            amount: amountText,
            amountAccessibilityLabel: accessibleAmountText
          }}
        />
      );
    }

    return (
      <SwipableListItemTransaction
        {...swipeActionProps}
        paymentLogoIcon={transactionLogo}
        onPress={onPress}
        title={recipient}
        accessible
        accessibilityLabel={accessibilityLabel}
        subtitle={datetime}
        transaction={{
          amount: amountText,
          amountAccessibilityLabel: accessibleAmountText
        }}
      />
    );
  },
  (prevProps, nextProps) => prevProps.transaction === nextProps.transaction
);

export { ReceiptListItemTransaction };
