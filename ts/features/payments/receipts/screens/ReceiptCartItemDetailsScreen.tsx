import { Divider, H6, ListItemInfoCopy } from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import { UserDetail } from "../../../../../definitions/pagopa/biz-events/UserDetail";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import * as analytics from "../analytics";
import { PaymentsReceiptParamsList } from "../navigation/params";
import { formatAmountText } from "../utils";
import { PaymentListItemInfo } from "../../common/components/PaymentListItemInfo";

export type ReceiptCartItemDetailsScreenParams = {
  cartItem: CartItem;
};

type ReceiptCartItemDetailsScreenProps = RouteProp<
  PaymentsReceiptParamsList,
  "PAYMENT_RECEIPT_CART_ITEM_DETAILS"
>;

const ReceiptCartItemDetailsScreen = () => {
  const route = useRoute<ReceiptCartItemDetailsScreenProps>();
  const { cartItem } = route.params;

  const getDebtorText = (debtor: UserDetail) => (
    <>
      {debtor.name ? <H6>{debtor.name}</H6> : null}
      {debtor.taxCode ? <H6>({debtor.taxCode})</H6> : null}
    </>
  );

  const getDebtorTextString = (debtor: UserDetail): string => {
    const name = debtor.name ?? "";
    const taxCode = debtor.taxCode ? `(${debtor.taxCode})` : "";
    return `${name} ${taxCode}`.trim();
  };

  useOnFirstRender(() => {
    analytics.trackPaymentsOpenSubReceipt();
  });

  return (
    <IOScrollViewWithLargeHeader
      includeContentMargins
      testID="cart-item-details-scroll-view"
      title={{
        label: cartItem.subject ?? ""
      }}
    >
      {cartItem.amount && (
        <>
          <PaymentListItemInfo
            label={I18n.t("transaction.details.operation.amount")}
            value={formatAmountText(cartItem.amount)}
          />
          <Divider />
        </>
      )}
      {cartItem.payee && (
        <>
          <PaymentListItemInfo
            label={I18n.t("transaction.details.operation.creditor")}
            value={cartItem.payee.name}
          />
          <Divider />
        </>
      )}
      {cartItem.debtor && (cartItem.debtor.name ?? cartItem.debtor.taxCode) && (
        <>
          <PaymentListItemInfo
            label={I18n.t("transaction.details.operation.debtor")}
            value={getDebtorText(cartItem.debtor)}
            copyableValue={getDebtorTextString(cartItem.debtor)}
          />
          <Divider />
        </>
      )}
      {cartItem.refNumberValue && (
        <>
          <ListItemInfoCopy
            onPress={() =>
              clipboardSetStringWithFeedback(cartItem.refNumberValue)
            }
            label={I18n.t("transaction.details.operation.noticeCode")}
            accessibilityLabel={I18n.t(
              "transaction.details.operation.noticeCodeAccessible"
            )}
            value={cartItem.refNumberValue}
          />
          <Divider />
        </>
      )}
      {cartItem.payee && (
        <ListItemInfoCopy
          onPress={() =>
            clipboardSetStringWithFeedback(cartItem.payee?.taxCode ?? "")
          }
          label={I18n.t("transaction.details.operation.taxCode")}
          accessibilityLabel={I18n.t("transaction.details.operation.taxCode")}
          value={cartItem.payee?.taxCode}
          numberOfLines={4}
        />
      )}
    </IOScrollViewWithLargeHeader>
  );
};

export default ReceiptCartItemDetailsScreen;
