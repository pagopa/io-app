import { IOColors } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Circle, ClipPath, Defs, Path, Rect, Svg } from "react-native-svg";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { useIOSelector } from "../../store/hooks";

const CIRCLE_MASK_SIZE = 32;

type Props = {
  mode: "mask" | "draw-on-top";
};

const BonusCardShape = (props: Props) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  switch (props.mode) {
    case "mask": {
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
              fill={
                IOColors[isDesignSystemEnabled ? "blueItalia-50" : "blueIO-50"]
              }
              clipPath="url(#clip)"
              rx={24}
              ry={24}
            />
          </Svg>
        </View>
      );
    }
    case "draw-on-top": {
      return (
        <View style={styles.container}>
          <Svg width="100%" height="100%">
            <Circle fill="white" cx="0" cy="76%" r={CIRCLE_MASK_SIZE / 2} />
            <Circle fill="white" cx="100%" cy="76%" r={CIRCLE_MASK_SIZE / 2} />
          </Svg>
          <Svg
            width="24"
            height="24"
            style={{
              position: "absolute",
              top: 0,
              left: 0
            }}
          >
            <Path fill="white" d="M 0 24 A 24 24, 0, 0, 1, 24 0 L 0 0 Z" />
          </Svg>
          <Svg
            width="24"
            height="24"
            style={{
              position: "absolute",
              top: 0,
              right: 0
            }}
          >
            <Path fill="white" d="M 0 0 A 24 24, 0, 0, 1, 24 24 L 24 0 Z" />
          </Svg>
          <Svg
            width="24"
            height="24"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0
            }}
          >
            <Path fill="white" d="M 24 0 A 24 24, 0, 0, 1, 0 24 L 24 24 Z" />
          </Svg>
          <Svg
            width="24"
            height="24"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0
            }}
          >
            <Path fill="white" d="M 24 24 A 24 24, 0, 0, 1, 0 0 L 0 24 Z" />
          </Svg>
        </View>
      );
    }
  }
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
