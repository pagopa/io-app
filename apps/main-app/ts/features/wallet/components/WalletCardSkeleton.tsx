import {
  IOColors,
  IODimensions,
  IOSkeleton,
  useIOThemeContext,
  VStack
} from "@io-app/design-system";
import { StyleSheet, View } from "react-native";

import { withWalletCardBaseComponent } from "./WalletCardBaseComponent";

const WalletCardSkeleton = withWalletCardBaseComponent(() => {
  const { themeType } = useIOThemeContext();

  const cardColor =
    themeType === "light" ? IOColors["grey-100"] : IOColors["grey-850"];

  const skeletonColor =
    themeType === "light" ? IOColors["grey-200"] : IOColors["grey-900"];

  return (
    <View style={[styleSheet.card, { backgroundColor: cardColor }]}>
      <View style={styleSheet.wrapper}>
        <View style={styleSheet.paymentInfo}>
          <IOSkeleton
            color={skeletonColor}
            height={24}
            radius={28}
            shape="rectangle"
            width={"60%"}
          />
          <IOSkeleton
            color={skeletonColor}
            height={24}
            radius={28}
            shape="rectangle"
            width={"20%"}
          />
        </View>
        <VStack space={8}>
          <IOSkeleton
            color={skeletonColor}
            height={18}
            radius={28}
            shape="rectangle"
            width={"55%"}
          />
          <IOSkeleton
            color={skeletonColor}
            height={18}
            radius={28}
            shape="rectangle"
            width={"45%"}
          />
        </VStack>
      </View>
    </View>
  );
});

const borderColor = "#0000001F";

const styleSheet = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10,
    borderRadius: IODimensions.radius.card,
    borderWidth: IODimensions.stroke.default,
    borderColor,
    paddingTop: 4
  },
  wrapper: {
    padding: IODimensions.padding.card,
    flex: 1,
    justifyContent: "space-between"
  },
  paymentInfo: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

export { WalletCardSkeleton };
