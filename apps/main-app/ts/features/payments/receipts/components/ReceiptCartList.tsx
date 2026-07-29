import {
  HStack,
  IOSkeleton,
  ListItemTransaction,
  VStack
} from "@io-app/design-system";
import { View } from "react-native";

import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { formatAmountText } from "../utils";

type Props = {
  carts?: ReadonlyArray<CartItem>;
  loading: boolean;
  onPress: (cartItem: CartItem) => void;
};

/** This component renders a list of transaction cart details */
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
          onPress={() => onPress(cartItem)}
          showChevron
          subtitle={cartItem.payee?.name ?? ""}
          title={cartItem.subject ?? ""}
          transaction={{
            amount: formatAmountText(cartItem.amount),
            amountAccessibilityLabel:
              getAccessibleAmountText(formatAmountText(cartItem.amount)) ?? ""
          }}
        />
      ))}
    </>
  );
};

const SkeletonTransactionDetailsList = () => (
  <View
    style={{
      flex: 1,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between"
    }}
    testID="skeleton-transaction-details-list"
  >
    <View style={{ paddingVertical: 12 }}>
      <VStack space={8} style={{ flex: 1 }}>
        <IOSkeleton height={16} radius={4} shape="rectangle" width="90%" />
        <IOSkeleton height={16} radius={4} shape="rectangle" width="30%" />
      </VStack>
    </View>
    <HStack space={16} style={{ alignItems: "center" }}>
      <IOSkeleton height={16} radius={4} shape="rectangle" width={48} />
      <IOSkeleton radius={4} shape="square" size={16} />
    </HStack>
  </View>
);
