import { IOColors } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Circle, ClipPath, Defs, Rect, Svg } from "react-native-svg";

const CIRCLE_MASK_SIZE = 32;

const BonusCardShape = () => (
  <View style={styles.container}>
    <View style={[styles.card, styles.cardTop]} />
    <CardShapeMask />
    <View style={[styles.card, styles.cardBottom]} />
  </View>
);

const CardShapeMask = () => (
  <Svg width="100%" height={CIRCLE_MASK_SIZE}>
    <Defs>
      <ClipPath id="clip">
        <Circle cx="0" cy="50%" r={CIRCLE_MASK_SIZE / 2} />
        <Circle cx="100%" cy="50%" r={CIRCLE_MASK_SIZE / 2} />
        <Rect x="0" y="0" width="100%" height="100%" />
      </ClipPath>
    </Defs>
    <Rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill={IOColors["blueItalia-50"]}
      clipPath="url(#clip)"
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  card: {
    backgroundColor: IOColors["blueItalia-50"]
  },
  cardTop: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexGrow: 11
  },
  cardBottom: {
    flex: 1,
    flexGrow: 3,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  }
});

export { BonusCardShape };
