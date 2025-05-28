import { IOColors, IOSkeleton, VStack } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { withWalletCardBaseComponent } from "./WalletCardBaseComponent";

const WalletCardSkeleton = withWalletCardBaseComponent(() => (
  <View style={styleSheet.card}>
    <View style={styleSheet.wrapper}>
      <View style={styleSheet.paymentInfo}>
        <IOSkeleton
          color={IOColors["grey-200"]}
          shape="rectangle"
          width={"60%"}
          height={24}
          radius={28}
        />
        <IOSkeleton
          color={IOColors["grey-200"]}
          shape="rectangle"
          width={"20%"}
          height={24}
          radius={28}
        />
      </View>
      <VStack space={8}>
        <IOSkeleton
          color={IOColors["grey-200"]}
          shape="rectangle"
          width={"55%"}
          height={18}
          radius={28}
        />
        <IOSkeleton
          color={IOColors["grey-200"]}
          shape="rectangle"
          width={"45%"}
          height={18}
          radius={28}
        />
      </VStack>
    </View>
  </View>
));

const borderColor = "#0000001F";

const styleSheet = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10,
    backgroundColor: IOColors["grey-100"],
    borderRadius: 8,
    borderWidth: 1,
    borderColor,
    paddingTop: 4
  },
  wrapper: {
    padding: 16,
    flex: 1,
    justifyContent: "space-between"
  },
  paymentInfo: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

export { WalletCardSkeleton };
