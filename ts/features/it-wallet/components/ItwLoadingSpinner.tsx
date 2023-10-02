import React, { useEffect, useRef } from "react";
import { StyleSheet, View, ColorValue, Animated, Easing } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { WithTestID } from "../../../types/WithTestID";

type Props = WithTestID<{
  captionTitle?: string;
  captionSubtitle?: string;
  color?: ColorValue;
  durationMs?: number;
  size?: IOLodingSpinnerSizeScale;
}>;

/**
 * Size scale, 76 is kept for backward compatibility with the old design system but 48 is enough for the new one.
 * It will be removed in the future.
 */
export type IOLodingSpinnerSizeScale = 12 | 16 | 20 | 24 | 30 | 32 | 48 | 76;

const styles = StyleSheet.create({
  progress: {
    width: "100%",
    height: "100%",
    borderBottomColor: IOColors.white,
    position: "absolute"
  }
});

const startRotationAnimation = (
  durationMs: number,
  rotationDegree: Animated.Value
): void => {
  Animated.loop(
    Animated.timing(rotationDegree, {
      toValue: 360,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: true
    })
  ).start();
};

const ItwLoadingSpinner = ({
  color = IOColors["blueIO-500"],
  size = 24,
  durationMs = 1000
}: Props): React.ReactElement => {
  const rotationDegree = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startRotationAnimation(durationMs, rotationDegree);
  }, [durationMs, rotationDegree]);

  return (
    <>
      <View
        style={{ width: size, height: size }}
        accessibilityRole="progressbar"
        testID={"LoadingSpinnerTestID"}
      >
        <Animated.View
          testID={"LoadingSpinnerAnimatedTestID"}
          style={[
            styles.progress,
            {
              borderWidth: 3,
              borderRadius: size / 2,
              borderTopColor: color,
              borderRightColor: color,
              borderLeftColor: color
            },
            {
              transform: [
                {
                  rotateZ: rotationDegree.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"]
                  })
                }
              ]
            }
          ]}
        />
      </View>
    </>
  );
};

export default ItwLoadingSpinner;
