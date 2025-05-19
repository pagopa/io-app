import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import { H5, IOColors } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n.ts";

/**
 * This component renders the logo of the IT Wallet, image and text.
 */
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
      <H5 style={styles.text}>{I18n.t("features.itWallet.title")}</H5>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: "100%"
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 15
  },
  text: {
    color: IOColors.white
  },
  icon: {
    width: 20,
    height: 20,
    backgroundColor: IOColors.white
  }
});

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
          end={vec(width, 0)}
          colors={[
            "#0B3EE3",
            "#234FFF",
            "#436FFF",
            "#2F5EFF",
            "#1E53FF",
            "#1848F0",
            "#0B3EE3",
            "#1F4DFF",
            "#2A5CFF",
            "#1943E8",
            "#0B3EE3"
          ]}
        />
      </RoundedRect>
    </Canvas>
  );
};
