import { GestureResponderEvent, ViewStyle } from "react-native";
import {
  AnimatedStyle,
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle
} from "react-native-reanimated";
import { useIOTheme } from "../context";
import { hexToRgba, IOColors, IOScaleEffect } from "../core";
import { useSpringPressProgressValue } from "../utils/hooks";

export const useListItemAnimation = (): {
  progress: SharedValue<number>;
  onPressIn: (event: GestureResponderEvent) => void;
  onPressOut: (event: GestureResponderEvent) => void;
  scaleAnimatedStyle: AnimatedStyle<ViewStyle>;
  backgroundAnimatedStyle: AnimatedStyle<ViewStyle>;
} => {
  const { progress, onPressIn, onPressOut } =
    useSpringPressProgressValue("button");

  const theme = useIOTheme();

  const mapBackgroundStates: Record<string, string> = {
    default: hexToRgba(IOColors[theme["listItem-pressed"]], 0),
    pressed: IOColors[theme["listItem-pressed"]]
  };

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
      [mapBackgroundStates.default, mapBackgroundStates.pressed]
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
