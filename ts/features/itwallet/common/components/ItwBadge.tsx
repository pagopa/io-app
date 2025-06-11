import { useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import { Caption, IOColors } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n.ts";

/**
 * This component renders the logo of the IT Wallet, image and text.
 */
// TODO: replace with the correct image [SIW-2412]
export const ItwBadge = () => (
  <View style={styles.container}>
    <StaticGradientBackground />
    <View style={styles.content}>
      <Image
        accessibilityIgnoresInvertColors
        accessible={true}
        resizeMode="contain"
        style={styles.icon}
      />
      <Caption style={styles.text}>{I18n.t("features.itWallet.title")}</Caption>
    </View>
  </View>
);

const StaticGradientBackground = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <Canvas
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <RoundedRect x={0} y={0} width={width} height={height} r={100}>
        <LinearGradient
          start={vec(0, height)}
          end={vec(width, height + width * Math.tan((60 * Math.PI) / 180))}
          colors={["#002FCB", "#003BFE", "#0335DA", "#053FFF", "#0335DD"]}
        />
      </RoundedRect>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderCurve: "continuous",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    })
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  text: {
    color: IOColors.white,
    fontWeight: "bold"
  },
  icon: {
    width: 14,
    height: 14,
    backgroundColor: IOColors.white
  }
});
