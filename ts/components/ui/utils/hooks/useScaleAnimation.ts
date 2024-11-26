/**
 * Remove this once this is merged: https://github.com/pagopa/io-app-design-system/pull/358
 */
import { IOSpringValues } from "@pagopa/io-app-design-system";
import { GestureResponderEvent, ViewStyle } from "react-native";
import {
  AnimatedStyle,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle
} from "react-native-reanimated";
import { useSpringPressProgressValue } from "./useSpringPressProgressValue";

export const IOScaleEffect = {
  // Slight scale effect
  slight: 0.99,
  // Medium scale effect
  medium: 0.97,
  // Exaggerated scale effect
  exaggerated: 0.95
};

export type IOScaleEffect = keyof typeof IOScaleEffect;

export const useScaleAnimation = (
  magnitude: IOScaleEffect = "slight"
): {
  progress: SharedValue<number>;
  onPressIn: (event: GestureResponderEvent) => void;
  onPressOut: (event: GestureResponderEvent) => void;
  scaleAnimatedStyle: AnimatedStyle<ViewStyle>;
} => {
  const { progress, onPressIn, onPressOut } = useSpringPressProgressValue(
    IOSpringValues.button
  );

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleEffect[magnitude];

  const scaleAnimatedStyle = useAnimatedStyle(() => {
    // Scale down button slightly when pressed
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  return { progress, onPressIn, onPressOut, scaleAnimatedStyle };
};
