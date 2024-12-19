import {
  IOListItemVisualParams,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import Placeholder from "rn-placeholder";

export const WalletPaymentMethodItemSkeleton = () => (
  <>
    <VSpacer />
    <View style={IOStyles.row}>
      <View>
        <Placeholder.Box
          width={IOListItemVisualParams.iconSize}
          height={IOListItemVisualParams.iconSize}
          animate="fade"
          radius={4}
        />
      </View>
      <View
        style={[
          IOStyles.flex,
          { paddingLeft: IOListItemVisualParams.iconMargin }
        ]}
      >
        <Placeholder.Box width={"100%"} height={24} animate="fade" radius={4} />
      </View>
    </View>
    <VSpacer />
  </>
);
