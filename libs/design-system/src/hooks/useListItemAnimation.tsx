import { GestureResponderEvent, ViewStyle } from "react-native";
import {
  AnimatedStyle,
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle
} from "react-native-reanimated";

import { useIOColors } from "../context";
import { IOScaleEffect } from "../core";
import { useSpringPressProgressValue } from "../utils/hooks";

export const useListItemAnimation = (): {
  backgroundAnimatedStyle: AnimatedStyle<ViewStyle>;
  onPressIn: (event: GestureResponderEvent) => void;
  onPressOut: (event: GestureResponderEvent) => void;
  progress: SharedValue<number>;
  scaleAnimatedStyle: AnimatedStyle<ViewStyle>;
} => {
  const { progress, onPressIn, onPressOut } =
    useSpringPressProgressValue("button");

  const backgroundColors = useIOColors().component.listItem.background;

  // Interpolate animation values from `isPressed` values
  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [1, IOScaleEffect.slight],
          Extrapolation.CLAMP
        )
      }
    ]
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [backgroundColors.default, backgroundColors.pressed]
    )
  }));

  return {
    progress,
    onPressIn,
    onPressOut,
    scaleAnimatedStyle,
    backgroundAnimatedStyle
  };
};
