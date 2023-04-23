/* eslint-disable functional/immutable-data */
import React from "react";
import { ViewStyle } from "react-native";
import Animated, {
  WithSpringConfig,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";

type Props = {
  visible?: boolean;
  springConfig?: WithSpringConfig;
  delayOut?: number;
  delayIn?: number;
  children: React.ReactNode;
  style?: ViewStyle;
};

const ScaleInOutAnimation = ({
  visible = true,
  springConfig = { damping: 500, mass: 3, stiffness: 1000 },
  delayOut = 0,
  delayIn = 0,
  children,
  style
}: Props) => {
  const scale = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  React.useEffect(() => {
    scale.value = visible
      ? withDelay(delayIn, withSpring(1, springConfig))
      : withDelay(delayOut, withTiming(0));
  }, [springConfig, visible, scale, delayIn, delayOut]);

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
};

export { ScaleInOutAnimation };
