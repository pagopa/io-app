import * as React from "react";
import { useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent
  // PixelRatio
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate,
  interpolateColor
} from "react-native-reanimated";
import { IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { BaseTypography } from "../core/typography/BaseTypography";
import { IOButtonStyles } from "../core/variables/IOStyles";
import { WithTestID } from "../../types/WithTestID";

export type ButtonSolid = WithTestID<{
  color?: "primary" | "danger" | "contrast";
  label: string;
  small?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: (event: GestureResponderEvent) => void;
}>;

type ColorStates = {
  default: string;
  pressed: string;
  label: {
    default: IOColors;
    disabled: IOColors;
  };
};

// COMPONENT CONFIGURATION

const mapColorStates: Record<NonNullable<ButtonSolid["color"]>, ColorStates> = {
  // Primary button
  primary: {
    default: IOColors.blue,
    pressed: IOColors["blue-600"],
    label: {
      default: "white",
      disabled: "white"
    }
  },
  // Danger button
  danger: {
    default: IOColors["error-600"],
    pressed: IOColors["error-500"],
    label: {
      default: "white",
      disabled: "white"
    }
  },
  // Contrast button
  contrast: {
    default: IOColors.white,
    pressed: IOColors["blue-50"],
    label: {
      default: "blue",
      disabled: "white"
    }
  }
};

// Disabled state
const colorPrimaryButtonDisabled: IOColors = "bluegreyLight";

const styles = StyleSheet.create({
  backgroundDisabled: {
    backgroundColor: IOColors[colorPrimaryButtonDisabled]
  }
});

export const ButtonSolid = ({
  color = "primary",
  label,
  small = false,
  fullWidth = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: ButtonSolid) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.basicButton?.pressedState;

  // Using a spring-based animation for our interpolations
  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const pressedAnimationStyle = useAnimatedStyle(() => {
    // Link color states to the pressed states
    const bgColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [mapColorStates[color].default, mapColorStates[color].pressed]
    );

    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor: bgColor,
      transform: [{ scale }]
    };
  });

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      disabled={disabled}
      style={!fullWidth ? IOButtonStyles.dimensionsDefault : {}}
    >
      <Animated.View
        style={[
          IOButtonStyles.button,
          small
            ? IOButtonStyles.buttonSizeSmall
            : IOButtonStyles.buttonSizeDefault,
          disabled
            ? styles.backgroundDisabled
            : { backgroundColor: mapColorStates[color]?.default },
          /* Prevent Reanimated from overriding background colors
          if button is disabled */
          !disabled && pressedAnimationStyle
        ]}
      >
        <BaseTypography
          weight={"Bold"}
          color={
            disabled
              ? mapColorStates[color]?.label?.disabled
              : mapColorStates[color]?.label?.default
          }
          style={[
            IOButtonStyles.label,
            small
              ? IOButtonStyles.labelSizeSmall
              : IOButtonStyles.labelSizeDefault
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
          /* A11y-related props:
          DON'T UNCOMMENT THEM */
          /* allowFontScaling
          maxFontSizeMultiplier={1.3} */
        >
          {label}
        </BaseTypography>
      </Animated.View>
    </Pressable>
  );
};

export default ButtonSolid;
