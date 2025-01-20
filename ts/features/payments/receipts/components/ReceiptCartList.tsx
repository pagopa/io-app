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
import { getAccessibleAmountText } from "../../../../utils/accessibility";

type Props = {
  carts?: ReadonlyArray<CartItem>;
  loading: boolean;
  onPress: (cartItem: CartItem) => void;
};

/**
 * This component renders a list of transaction cart details
 */
export const ReceiptCartList = ({ carts, loading, onPress }: Props) => {
  if (loading) {
    return <SkeletonTransactionDetailsList />;
  }
  if (!carts) {
    return null;
  }

  return (
    <>
      {carts.map((cartItem, index) => (
        <ListItemTransaction
          key={cartItem.refNumberValue ?? index.toString()}
          title={cartItem.subject ?? ""}
          subtitle={cartItem.payee?.name ?? ""}
          transaction={{
            amount: formatAmountText(cartItem.amount),
            amountAccessibilityLabel:
              getAccessibleAmountText(formatAmountText(cartItem.amount)) ?? ""
          }}
          showChevron
          onPress={() => onPress(cartItem)}
        />
      ))}
    </>
  );
};

const SkeletonTransactionDetailsList = () => (
  <View
    style={[IOStyles.flex, IOStyles.rowSpaceBetween, IOStyles.alignCenter]}
    testID="skeleton-transaction-details-list"
  >
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
