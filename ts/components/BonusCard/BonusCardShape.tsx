import { IOColors } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Circle, ClipPath, Defs, Rect, Svg } from "react-native-svg";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { useIOSelector } from "../../store/hooks";

const CIRCLE_MASK_SIZE = 32;

const BonusCardShape = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%">
        <Defs>
          <ClipPath id="clip">
            <Circle cx="0" cy="76%" r={CIRCLE_MASK_SIZE / 2} />
            <Circle cx="100%" cy="76%" r={CIRCLE_MASK_SIZE / 2} />
            <Rect width="100%" height="100%" />
          </ClipPath>
        </Defs>
        <Rect
          width="100%"
          height="100%"
          fill={IOColors[isDesignSystemEnabled ? "blueItalia-50" : "blueIO-50"]}
          clipPath="url(#clip)"
          rx={24}
          ry={24}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
});

export { BonusCardShape };
