import {
  interpolateColor,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle
} from "react-native-reanimated";

import type { IOColorTheme } from "../../../core";
import type { IOButtonColor, IOButtonVariant } from "./IOButton";

type IOButtonColors =
  IOColorTheme["component"]["button"][IOButtonVariant][IOButtonColor];

export const useButtonAnimatedStyles = (
  variant: IOButtonVariant,
  buttonColors: IOButtonColors,
  progress: SharedValue<number>
) => {
  // Interpolate animation values from `isPressed` values
  const pressedAnimationStyle = useAnimatedStyle(() => {
    // `link` variant doesn't need this animated style
    if (variant === "link") {
      return {};
    }

    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [buttonColors.background.default, buttonColors.background.pressed]
    );

    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [buttonColors.foreground.default, buttonColors.foreground.pressed]
    );

    return variant === "outline"
      ? { backgroundColor, borderColor }
      : { backgroundColor };
  });

  const pressedColorLabelAnimationStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [buttonColors.foreground.default, buttonColors.foreground.pressed]
    )
  }));

  const iconColorAnimatedStyle = useAnimatedProps(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [buttonColors.foreground.default, buttonColors.foreground.pressed]
    )
  }));

  return {
    buttonAnimatedStyle: pressedAnimationStyle,
    labelAnimatedStyle: pressedColorLabelAnimationStyle,
    iconColorAnimatedStyle
  };
};
