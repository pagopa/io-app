import { Avatar, ListItemTransaction } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { memo, MutableRefObject, useMemo } from "react";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import ListItemSwipeAction from "../../../../components/ListItemSwipeAction";
import I18n from "../../../../i18n";
import { useIODispatch } from "../../../../store/hooks";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { getTransactionLogo } from "../../common/utils";
import { hidePaymentsReceiptAction } from "../store/actions";
import { formatAmountText } from "../utils";

type Props = {
  transaction: NoticeListItem;
  onPress?: () => void;
  openedItemRef?: MutableRefObject<(() => void) | null>;
};

const ReceiptListItemTransaction = memo(
  ({ transaction, onPress, openedItemRef }: Props) => {
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

    if (transaction.isCart) {
      return (
        <ListItemSwipeAction
          {...swipeActionProps}
          openedItemRef={openedItemRef}
        >
          <ListItemTransaction
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
        </ListItemSwipeAction>
      );
    }

    return (
      <ListItemSwipeAction {...swipeActionProps} openedItemRef={openedItemRef}>
        <ListItemTransaction
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
      </ListItemSwipeAction>
    );
  },
  (prevProps, nextProps) => prevProps.transaction === nextProps.transaction
);

export { ReceiptListItemTransaction };
