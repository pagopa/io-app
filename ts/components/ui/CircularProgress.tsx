import { ReactNode, useEffect } from "react";

import { ColorValue, StyleSheet, View } from "react-native";
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
  const progressLength = useSharedValue(0);

  const CIRCLE_LENGTH = 2 * Math.PI * radius;

  useEffect(() => {
    // Transforms progress 0-100 into 0-1
    const progressValue = Math.max(Math.min(progress / 100, 1), 0);
    // eslint-disable-next-line functional/immutable-data
    progressLength.value = Math.round(CIRCLE_LENGTH * (1 - progressValue));
  }, [progressLength, CIRCLE_LENGTH, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: progressLength.value
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
