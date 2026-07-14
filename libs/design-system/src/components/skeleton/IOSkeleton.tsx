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

type IOSkeletonSquare = {
  shape: "square";
  size: number;
  radius?: number;
  width?: never;
  height?: never;
};

type IOSkeletonRectangle = {
  shape: "rectangle";
  width: DimensionValue;
  height: number;
  radius?: number;
  size?: never;
};

export type IOSkeleton = WithTestID<
  (IOSkeletonSquare | IOSkeletonRectangle) & {
    color?: ColorValue;
  }
>;

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
      testID={testID}
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
    />
  );
};
