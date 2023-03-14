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
import { hexToRgba, IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { IOButtonStyles } from "../core/variables/IOStyles";
import { makeFontStyleObject } from "../core/fonts";
import { WithTestID } from "../../types/WithTestID";

export type ButtonOutline = WithTestID<{
  color?: "primary" | "neutral" | "contrast" | "danger";
  label: string;
  small?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: (event: GestureResponderEvent) => void;
}>;

type ColorStates = {
  border: {
    default: string;
    pressed: string;
    disabled: string;
  };
  background: {
    default: string;
    pressed: string;
    disabled: string;
  };
  label: {
    default: string;
    pressed: string;
    disabled: string;
  };
};

// COMPONENT CONFIGURATION

const mapColorStates: Record<
  NonNullable<ButtonOutline["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    border: {
      default: IOColors.blue,
      pressed: IOColors.blue,
      disabled: IOColors.bluegreyLight
    },
    background: {
      default: hexToRgba(IOColors.blue, 0),
      pressed: hexToRgba(IOColors.blue, 0.15),
      disabled: "transparent"
    },
    label: {
      default: IOColors.blue,
      pressed: IOColors.blue,
      disabled: IOColors.grey
    }
  },
  // Neutral button
  neutral: {
    border: {
      default: IOColors.grey,
      pressed: IOColors.bluegrey,
      disabled: IOColors.bluegreyLight
    },
    background: {
      default: IOColors.white,
      pressed: IOColors.greyUltraLight,
      disabled: "transparent"
    },
    label: {
      default: IOColors.bluegrey,
      pressed: IOColors.bluegreyDark,
      disabled: IOColors.grey
    }
  },
  // Contrast button
  contrast: {
    border: {
      default: IOColors.white,
      pressed: IOColors.white,
      disabled: hexToRgba(IOColors.white, 0.5)
    },
    background: {
      default: hexToRgba(IOColors.white, 0),
      pressed: hexToRgba(IOColors.white, 0.2),
      disabled: "transparent"
    },
    label: {
      default: IOColors.white,
      pressed: IOColors.white,
      disabled: hexToRgba(IOColors.white, 0.5)
    }
  },
  // Danger button
  danger: {
    border: {
      default: IOColors.red,
      pressed: IOColors.red,
      disabled: IOColors.bluegreyLight
    },
    background: {
      default: hexToRgba(IOColors.red, 0),
      pressed: hexToRgba(IOColors.red, 0.15),
      disabled: "transparent"
    },
    label: {
      default: IOColors.red,
      pressed: IOColors.red,
      disabled: IOColors.grey
    }
  }
};

const IOButtonStylesLocal = StyleSheet.create({
  label: {
    ...makeFontStyleObject("Bold")
  },
  buttonWithBorder: {
    borderWidth: 1
  }
});

export const ButtonOutline = ({
  color = "primary",
  label,
  small = false,
  fullWidth = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: ButtonOutline) => {
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
    const backgroundColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapColorStates[color].background.default,
        mapColorStates[color].background.pressed
      ]
    );

    const borderColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapColorStates[color].border.default,
        mapColorStates[color].border.pressed
      ]
    );

    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      borderColor,
      backgroundColor,
      transform: [{ scale }]
    };
  });

  const pressedColorLabelAnimationStyle = useAnimatedStyle(() => {
    // Link color states to the pressed states
    const labelColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [mapColorStates[color].label.default, mapColorStates[color].label.pressed]
    );

    return {
      color: labelColor
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
          IOButtonStylesLocal.buttonWithBorder,
          small
            ? IOButtonStyles.buttonSizeSmall
            : IOButtonStyles.buttonSizeDefault,
          disabled
            ? {
                backgroundColor: mapColorStates[color]?.background?.disabled,
                borderColor: mapColorStates[color]?.border?.disabled
              }
            : {
                backgroundColor: mapColorStates[color]?.background?.default,
                borderColor: mapColorStates[color]?.border.default
              },
          /* Prevent Reanimated from overriding background colors
          if button is disabled */
          !disabled && pressedAnimationStyle
        ]}
      >
        <Animated.Text
          style={[
            IOButtonStylesLocal.label,
            IOButtonStyles.label,
            small
              ? IOButtonStyles.labelSizeSmall
              : IOButtonStyles.labelSizeDefault,
            disabled
              ? { color: mapColorStates[color]?.label?.disabled }
              : { color: mapColorStates[color]?.label?.default },
            !disabled && pressedColorLabelAnimationStyle
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
          /* A11y-related props:
          DON'T UNCOMMENT THEM */
          /* allowFontScaling
          maxFontSizeMultiplier={1.3} */
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export default ButtonOutline;
