import {
  IOListItemVisualParams,
  IOSkeleton,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";

export const WalletPaymentMethodItemSkeleton = () => (
  <>
    <VSpacer />
    <View style={{ flexDirection: "row" }}>
      <View>
        <IOSkeleton
          shape="square"
          size={IOListItemVisualParams.iconSize}
          radius={8}
        />
      </View>
      <View style={{ flex: 1, paddingLeft: IOListItemVisualParams.iconMargin }}>
        <IOSkeleton shape="rectangle" radius={8} width={"100%"} height={24} />
      </View>
    </View>
    <VSpacer />
  </>
);
