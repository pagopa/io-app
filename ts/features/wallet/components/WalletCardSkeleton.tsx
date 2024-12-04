import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder, { BoxProps } from "rn-placeholder";
import { withWalletCardBaseComponent } from "./WalletCardBaseComponent";

const WalletCardSkeleton = withWalletCardBaseComponent(() => (
  <View style={styleSheet.card}>
    <View style={styleSheet.wrapper}>
      <View style={styleSheet.paymentInfo}>
        <View style={{ width: "60%" }}>
          <SkeletonPlaceholder height={24} width={"100%"} />
        </View>
        <View style={{ width: "20%" }}>
          <SkeletonPlaceholder height={24} width={"100%"} />
        </View>
      </View>
      <View style={styleSheet.additionalInfo}>
        <SkeletonPlaceholder height={18} width={"55%"} />
        <VSpacer size={8} />
        <SkeletonPlaceholder height={18} width={"45%"} />
      </View>
    </View>
  </View>
));

const SkeletonPlaceholder = (props: Pick<BoxProps, "width" | "height">) => (
  <Placeholder.Box
    animate="fade"
    radius={28}
    color={IOColors["grey-200"]}
    {...props}
  />
);

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
  },
  additionalInfo: {
    justifyContent: "space-between"
  }
});

export { WalletCardSkeleton };
