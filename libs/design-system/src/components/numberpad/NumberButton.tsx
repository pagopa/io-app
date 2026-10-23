import { memo, useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion
} from "react-native-reanimated";

import { useIOColors } from "../../context";
import { triggerHaptic } from "../../functions";
import { useScaleAnimation } from "../../hooks";
import { IOText } from "../typography";

type NumberButtonProps = {
  /** The button value. */
  number: number;
  /**
   * The action to be executed when the button is pressed.
   *
   * @param number
   * @returns Void
   */
  onPress: (number: number) => void;
  /** Used to choose the component color variant between `neutral` and `primary`. */
  variant: NumberButtonVariantType;
};

type NumberButtonVariantType = "neutral" | "primary";

const numberPadBtnSize = 56;

/**
 * Based on a `Pressable` element, it displays a number button with animations
 * on press In and Out.
 *
 * @returns {JSX.Element} The rendered `NumberButton`
 */
export const NumberButton = memo(
  ({ number, variant, onPress }: NumberButtonProps) => {
    const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
      useScaleAnimation("medium");
    const reducedMotion = useReducedMotion();

    const variantColors = useIOColors().component.numberButton[variant];

    // Interpolate animation values from `isPressed` values
    const pressedAnimationStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [variantColors.background.default, variantColors.background.pressed]
      )
    }));

    const handleOnPress = useCallback(() => {
      triggerHaptic("impactLight");
      onPress(number);
    }, [number, onPress]);

    return (
      <Pressable
        accessibilityRole="button"
        accessible
        onPress={handleOnPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={[
            numberButtonStyles.circularButton,
            numberButtonStyles.buttonSize,
            pressedAnimationStyle,
            !reducedMotion && scaleAnimatedStyle
          ]}
        >
          <IOText
            color={variantColors.foreground}
            size={22}
            style={{
              // Additional prop for Android
              textAlignVertical: "center"
            }}
            weight="Semibold"
          >
            {number}
          </IOText>
        </Animated.View>
      </Pressable>
    );
  }
);

export const numberButtonStyles = StyleSheet.create({
  circularButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: numberPadBtnSize / 2
  },
  buttonSize: {
    width: numberPadBtnSize,
    height: numberPadBtnSize
  }
});
