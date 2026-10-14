import { IODimensions, IOSkeleton, VSpacer } from "@io-app/design-system";
import { View } from "react-native";

export const WalletPaymentMethodItemSkeleton = () => (
  <>
    <VSpacer />
    <View style={{ flexDirection: "row" }}>
      <View>
        <IOSkeleton
          radius={8}
          shape="square"
          size={IODimensions.size.icon.listItem}
        />
      </View>
      <View
        style={{
          flex: 1,
          paddingLeft: IODimensions.gap.listItem.default.leading
        }}
      >
        <IOSkeleton height={24} radius={8} shape="rectangle" width={"100%"} />
      </View>
    </View>
    <VSpacer />
  </>
);
