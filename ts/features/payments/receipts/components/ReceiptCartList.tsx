import {
  HStack,
  IOSkeleton,
  ListItemTransaction,
  VStack
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { formatAmountText } from "../utils";

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
          key={`${cartItem.refNumberValue}${index}`}
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
    testID="skeleton-transaction-details-list"
    style={{
      flex: 1,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between"
    }}
  >
    <View style={{ paddingVertical: 12 }}>
      <VStack space={8} style={{ flex: 1 }}>
        <IOSkeleton shape="rectangle" width="90%" height={16} radius={4} />
        <IOSkeleton shape="rectangle" width="30%" height={16} radius={4} />
      </VStack>
    </View>
    <HStack space={16} style={{ alignItems: "center" }}>
      <IOSkeleton shape="rectangle" width={48} height={16} radius={4} />
      <IOSkeleton shape="square" size={16} radius={4} />
    </HStack>
  </View>
);
