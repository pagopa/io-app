import { useMemo } from "react";
import { ColorValue, DimensionValue, ViewStyle } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOColors, IOEasingCurves } from "../../core";
import { WithTestID } from "../../utils/types";

const ANIMATION_DURATION = 1250;
const [OPACITY_MIN, OPACITY_MAX] = [0.35, 0.75];
const OPACITY_REDUCED_MOTION = (OPACITY_MAX + OPACITY_MIN) / 2;

const pulseKeyframes = {
  "0%, 100%": { opacity: OPACITY_MAX },
  "50%": { opacity: OPACITY_MIN }
};

export type IOSkeleton = WithTestID<
  (IOSkeletonRectangle | IOSkeletonSquare) & {
    color?: ColorValue;
  }
>;

type IOSkeletonRectangle = {
  height: number;
  radius?: number;
  shape: "rectangle";
  size?: never;
  width: DimensionValue;
};

type IOSkeletonSquare = {
  height?: never;
  radius?: number;
  shape: "square";
  size: number;
  width?: never;
};

export const IOSkeleton = ({
  shape,
  size,
  width,
  height,
  radius: borderRadius,
  color,
  testID
}: IOSkeleton) => {
  const reduceMotion = useReducedMotion();
  const theme = useIOTheme();

  const backgroundColor = color ?? IOColors[theme["skeleton-background"]];

  const baseStyle: ViewStyle = useMemo(
    () => ({
      backgroundColor,
      width: shape === "square" ? size : width,
      height: shape === "square" ? size : height,
      borderRadius,
      borderCurve: "continuous"
    }),
    [backgroundColor, shape, size, width, height, borderRadius]
  );

  return (
    <Animated.View
      style={[
        baseStyle,
        reduceMotion
          ? { opacity: OPACITY_REDUCED_MOTION }
          : {
              animationName: pulseKeyframes,
              animationDuration: `${ANIMATION_DURATION}ms`,
              animationIterationCount: "infinite",
              animationTimingFunction: IOEasingCurves.easeInOutSine
            }
      ]}
      testID={testID}
    />
  );
};
