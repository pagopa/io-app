/* eslint-disable functional/immutable-data */
import React from "react";
import { ViewStyle } from "react-native";
import Animated, {
  LayoutAnimation,
  WithSpringConfig,
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
  const enteringAnimation = (): LayoutAnimation => {
    "worklet";
    return {
      initialValues: {
        transform: [{ scale: 0 }]
      },
      animations: {
        transform: [{ scale: withDelay(delayIn, withSpring(1, springConfig)) }]
      }
    };
  };

  const exitingAnimation = (): LayoutAnimation => {
    "worklet";
    return {
      initialValues: {
        transform: [{ scale: 1 }]
      },
      animations: {
        transform: [{ scale: withDelay(delayOut, withTiming(0)) }]
      }
    };
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={style}
      entering={enteringAnimation}
      exiting={exitingAnimation}
    >
      {children}
    </Animated.View>
  );
};

export { ScaleInOutAnimation };
