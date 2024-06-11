import * as React from "react";
import { ScrollView } from "react-native";
import {
  Divider,
  H6,
  IOStyles,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { PaymentsTransactionBizEventsParamsList } from "../navigation/params";
import I18n from "../../../../i18n";
import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import { UserDetail } from "../../../../../definitions/pagopa/biz-events/UserDetail";
import { formatAmountText } from "../utils";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";

export type PaymentsTransactionBizEventsCartItemDetailsScreenParams = {
  cartItem: CartItem;
};

export type PaymentsTransactionBizEventsCartItemDetailsScreenProps = RouteProp<
  PaymentsTransactionBizEventsParamsList,
  "PAYMENT_TRANSACTION_BIZ_EVENTS_CART_ITEM_DETAILS"
>;

const PaymentsTransactionBizEventsCartItemDetailsScreen = () => {
  const route =
    useRoute<PaymentsTransactionBizEventsCartItemDetailsScreenProps>();
  const { cartItem } = route.params;

  const getDebtorText = (debtor: UserDetail) => (
    <>
      {debtor.name ? <H6>{debtor.name}</H6> : null}
      {debtor.taxCode ? <H6>({debtor.taxCode})</H6> : null}
    </>
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: cartItem.subject ?? ""
      }}
    >
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        {cartItem.amount && (
          <>
            <ListItemInfo
              label={I18n.t("transaction.details.operation.amount")}
              value={formatAmountText(cartItem.amount)}
            />
            <Divider />
          </>
        )}
        {cartItem.payee && (
          <>
            <ListItemInfo
              label={I18n.t("transaction.details.operation.creditor")}
              value={cartItem.payee.name}
            />
            <Divider />
          </>
        )}
        {cartItem.debtor &&
          (cartItem.debtor.name || cartItem.debtor.taxCode) && (
            <>
              <ListItemInfo
                label={I18n.t("transaction.details.operation.debtor")}
                value={getDebtorText(cartItem.debtor)}
              />
              <Divider />
            </>
          )}
        {cartItem.refNumberValue && (
          <>
            <ListItemInfo
              label={I18n.t("transaction.details.operation.noticeCode")}
              value={cartItem.refNumberValue}
            />
            <Divider />
          </>
        )}
        {cartItem.payee && (
          <ListItemInfo
            numberOfLines={4}
            label={I18n.t("transaction.details.operation.taxCode")}
            value={cartItem.payee.taxCode}
          />
        )}
      </ScrollView>
    </IOScrollViewWithLargeHeader>
  );
};

export default PaymentsTransactionBizEventsCartItemDetailsScreen;
