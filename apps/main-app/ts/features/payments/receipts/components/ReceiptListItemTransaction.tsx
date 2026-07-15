import { Avatar, IOIcons, ListItemTransaction } from "@io-app/design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { memo, RefObject, useMemo } from "react";
import { Alert } from "react-native";

import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import ListItemSwipeAction, {
  SwipeControls
} from "../../../../components/ListItemSwipeAction";
import { useIODispatch } from "../../../../store/hooks";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { PaymentAnalyticsData } from "../../common/types/PaymentAnalytics";
import { getTransactionLogo } from "../../common/utils";
import {
  analyticsHideReceiptAction,
  analyticsHideReceiptConfirmAction
} from "../analytics/utils";
import { hidePaymentsReceiptAction } from "../store/actions";
import { formatAmountText } from "../utils";

type Props = {
  onPress?: () => void;
  openedItemRef?: RefObject<(() => void) | null>;
  transaction: NoticeListItem;
};

const ReceiptListItemTransaction = memo(
  ({ transaction, onPress, openedItemRef }: Props) => {
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

    const accessibleAmountText = getAccessibleAmountText(amountText) ?? "";
    const accessibilityLabel = `${recipient}; ${accessibleDatetime}; ${accessibleAmountText}`;

    const TransactionEmptyIcon = useMemo(() => <Avatar size="small" />, []);

    const transactionLogo = pipe(
      transactionPayeeLogoUri,
      O.map(uri => ({ uri })),
      O.getOrElseW(() => TransactionEmptyIcon)
    );

    const dispatch = useIODispatch();

    const paymentAnalyticsData: PaymentAnalyticsData = {
      receiptOrganizationName: transaction.payeeName,
      receiptOrganizationFiscalCode: transaction.payeeTaxCode,
      receiptUser: transaction.isPayer ? "payer" : "payee"
    };

    const swipeActionProps = {
      icon: "eyeHide" as IOIcons,
      accessibilityLabel: I18n.t(
        "features.payments.transactions.receipt.hideFromList"
      ),
      onRightActionPressed: ({
        resetSwipePosition,
        triggerSwipeAction
      }: SwipeControls) => {
        analyticsHideReceiptAction(paymentAnalyticsData, "swipe");

        Alert.alert(
          I18n.t(
            transaction.isCart
              ? "features.payments.transactions.receipt.hideBanner.isCart.title"
              : "features.payments.transactions.receipt.hideBanner.title"
          ),
          I18n.t(
            transaction.isCart
              ? "features.payments.transactions.receipt.hideBanner.isCart.content"
              : "features.payments.transactions.receipt.hideBanner.content"
          ),
          [
            {
              text: I18n.t("global.buttons.cancel"),
              style: "cancel",
              onPress: () => {
                setTimeout(() => {
                  resetSwipePosition();
                }, 50);
              }
            },
            {
              text: I18n.t(
                "features.payments.transactions.receipt.hideBanner.accept"
              ),
              style: "destructive",
              onPress: () => {
                analyticsHideReceiptConfirmAction(
                  paymentAnalyticsData,
                  "swipe"
                );
                triggerSwipeAction();
                dispatch(
                  hidePaymentsReceiptAction.request({
                    transactionId: transaction.eventId,
                    trigger: "swipe"
                  })
                );
              }
            }
          ]
        );
      }
    };

    return (
      <ListItemSwipeAction
        color="contrast"
        {...swipeActionProps}
        openedItemRef={openedItemRef}
      >
        <ListItemTransaction
          accessibilityLabel={accessibilityLabel}
          accessible
          onPress={onPress}
          paymentLogoIcon={transactionLogo}
          subtitle={datetime}
          title={recipient}
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
