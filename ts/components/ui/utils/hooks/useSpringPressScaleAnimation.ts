import {
  Extrapolate,
  interpolate,
  useAnimatedStyle
} from "react-native-reanimated";
import { IOScaleValues, IOSpringValues } from "@pagopa/io-app-design-system";
import { useSpringPressProgressValue } from "./useSpringPressProgressValue";

export const useSpringPressScaleAnimation = (
  springValue = IOSpringValues.button
) => {
  const { onPressIn, onPressOut, progress } =
    useSpringPressProgressValue(springValue);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.basicButton?.pressedState;

  // Interpolate animation values from `isPressed` values
  const animatedScaleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  return { onPressIn, onPressOut, animatedScaleStyle };
};
