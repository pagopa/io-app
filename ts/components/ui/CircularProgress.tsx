import { ReactNode, useEffect } from "react";

import { StyleSheet, View, ColorValue } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CircularProgressProps = {
  progress: number;
  size: number;
  radius: number;
  strokeColor: ColorValue;
  strokeBgColor: ColorValue;
  strokeWidth: number;
  children?: ReactNode;
};

export const CircularProgress = ({
  size,
  progress,
  radius = size / 2,
  strokeWidth,
  strokeColor,
  strokeBgColor,
  children
}: CircularProgressProps) => {
  const progressSharedValue = useSharedValue(0);

  const CIRCLE_LENGTH = 2 * Math.PI * radius;

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    progressSharedValue.value = progress / 100;
  }, [progress, progressSharedValue]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progressSharedValue.value)
  }));

  return (
    <View
      style={styles.circularProgressWrapper}
      testID={`circular-progress-${Math.round(progress)}`}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Circle Background */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            stroke={strokeBgColor}
            strokeWidth={strokeWidth}
          />
          {/* Active circle (animated) */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={CIRCLE_LENGTH}
            animatedProps={animatedProps}
            strokeLinecap={"round"}
          />
        </G>
      </Svg>
      <View
        style={[
          styles.childrenWrapper,
          {
            width: (radius - strokeWidth) * 2,
            height: (radius - strokeWidth) * 2,
            borderRadius: radius - strokeWidth
          }
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  circularProgressWrapper: {
    alignItems: "center",
    justifyContent: "center"
  },
  childrenWrapper: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute"
  }
});
