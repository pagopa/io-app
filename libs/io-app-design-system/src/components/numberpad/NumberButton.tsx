import { memo, useCallback, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion
} from "react-native-reanimated";
import { useIOTheme } from "../../context";
import { hexToRgba, IOColors } from "../../core";
import { useScaleAnimation } from "../../hooks";
import { IOText } from "../typography";

type NumberButtonVariantType = "neutral" | "primary";

type NumberButtonProps = {
  /**
   * Used to choose the component color variant between `neutral` and `primary`.
   */
  variant: NumberButtonVariantType;
  /**
   * The button value.
   */
  number: number;
  /**
   * The action to be executed when the button is pressed.
   * @param number
   * @returns void
   */
  onPress: (number: number) => void;
};

type ColorMapVariant = {
  background: string;
  pressed: string;
  foreground: IOColors;
};

const numberPadBtnSize: number = 56;

/**
 * Based on a `Pressable` element, it displays a number button with animations on press In and Out.
 *
 * @returns {JSX.Element} The rendered `NumberButton`
 */
export const NumberButton = memo(
  ({ number, variant, onPress }: NumberButtonProps) => {
    const theme = useIOTheme();

    const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
      useScaleAnimation("medium");
    const reducedMotion = useReducedMotion();

    const colorMap: Record<NumberButtonVariantType, ColorMapVariant> = useMemo(
      () => ({
        neutral: {
          background: hexToRgba(
            IOColors[theme["interactiveElem-default"]],
            0.1
          ),
          pressed: hexToRgba(IOColors[theme["interactiveElem-default"]], 0.35),
          foreground: theme["interactiveElem-default"]
        },
        primary: {
          background: hexToRgba(IOColors.white, 0.15),
          pressed: hexToRgba(IOColors.white, 0.5),
          foreground: "white"
        }
      }),
      [theme]
    );

    // Interpolate animation values from `isPressed` values
    const pressedAnimationStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [colorMap[variant].background, colorMap[variant].pressed]
      )
    }));

    const handleOnPress = useCallback(() => {
      ReactNativeHapticFeedback.trigger("impactLight");
      onPress(number);
    }, [number, onPress]);

    return (
      <Pressable
        accessible
        accessibilityRole="button"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handleOnPress}
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
            size={22}
            weight="Semibold"
            color={colorMap[variant].foreground}
            style={{
              // Additional prop for Android
              textAlignVertical: "center"
            }}
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
