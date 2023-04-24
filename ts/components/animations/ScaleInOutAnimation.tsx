/* eslint-disable functional/immutable-data */
import React from "react";
import { ViewStyle } from "react-native";
import Animated, {
  LayoutAnimation,
  WithSpringConfig,
  withDelay,
  withSpring
} from "react-native-reanimated";
import { IOSpringValues } from "../core/variables/IOAnimations";

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
  springConfig = IOSpringValues.button,
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
        transform: [{ scale: withDelay(delayOut, withSpring(0, springConfig)) }]
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
