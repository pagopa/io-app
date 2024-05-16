import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  HSpacer,
  IOStyles,
  ListItemTransaction,
  VSpacer
} from "@pagopa/io-app-design-system";
import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import { formatAmountText } from "../utils";

type Props = {
  carts?: ReadonlyArray<CartItem>;
  loading: boolean;
  onPress: (cartItem: CartItem) => void;
};

/**
 * This component renders a list of transaction cart details
 */
export const WalletBizEventsTransactionCartList = ({
  carts,
  loading,
  onPress
}: Props) => {
  if (loading) {
    return <SkeletonTransactionDetailsList />;
  }
  if (!carts) {
    return <></>;
  }

  return (
    <>
      {carts.map((cartItem, index) => (
        <ListItemTransaction
          key={index.toString()}
          title={cartItem.subject ?? ""}
          subtitle={cartItem.payee?.name ?? ""}
          transactionStatus="success"
          transactionAmount={
            cartItem.amount ? formatAmountText(cartItem.amount) : ""
          }
          hasChevronRight
          onPress={() => onPress(cartItem)}
        />
      ))}
    </>
  );
};

const SkeletonTransactionDetailsList = () => (
  <View style={[IOStyles.flex, IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
    <View style={[IOStyles.flex, { paddingVertical: 12 }]}>
      <Placeholder.Box height={16} width="90%" radius={4} />
      <VSpacer size={8} />
      <Placeholder.Box height={16} width="30%" radius={4} />
    </View>
    <Placeholder.Box height={16} width={48} radius={4} />
    <HSpacer size={16} />
    <Placeholder.Box height={16} width={16} radius={4} />
  </View>
);
