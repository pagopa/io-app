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
          radius={8}
          shape="square"
          size={IOListItemVisualParams.iconSize}
        />
      </View>
      <View style={{ flex: 1, paddingLeft: IOListItemVisualParams.iconMargin }}>
        <IOSkeleton height={24} radius={8} shape="rectangle" width={"100%"} />
      </View>
    </View>
    <VSpacer />
  </>
);
