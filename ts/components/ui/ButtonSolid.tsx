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
import themeVariables from "../../theme/variables";
import { IOColors, IOColorType } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { BaseTypography } from "../core/typography/BaseTypography";
import { IOButtonStyles } from "../core/variables/IOStyles";

type Props = {
  color?: "primary" | "danger" | "white";
  label: string;
  small?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: (event: GestureResponderEvent) => void;
};

type ColorStates = {
  default: string;
  pressed: string;
  label: IOColorType;
  labelDisabled: IOColorType;
};

// -- Primary button
const colorPrimaryButtonDefault: IOColorType = "blue";
const colorPrimaryButtonPressed: IOColorType = "blueUltraLight";
const colorPrimaryButtonText: IOColorType = "white";
const colorPrimaryButtonTextDisabled: IOColorType = "white";
// -- Danger button
const colorDangerButtonDefault: IOColorType = "red";
const colorDangerButtonPressed: IOColorType = "red";
const colorDangerButtonText: IOColorType = "white";
const colorDangerButtonTextDisabled: IOColorType = "white";
// -- White button
const colorWhiteButtonDefault: IOColorType = "white";
const colorWhiteButtonPressed: IOColorType = "greyLight";
const colorWhiteButtonText: IOColorType = "blue";
const colorWhiteButtonTextDisabled: IOColorType = "white";
// -- Disabled state
const colorPrimaryButtonDisabled: IOColorType = "bluegreyLight";

const mapColorStates: Record<NonNullable<Props["color"]>, ColorStates> = {
  primary: {
    default: IOColors[colorPrimaryButtonDefault],
    pressed: IOColors[colorPrimaryButtonPressed],
    label: colorPrimaryButtonText,
    labelDisabled: colorPrimaryButtonTextDisabled
  },
  danger: {
    default: IOColors[colorDangerButtonDefault],
    pressed: IOColors[colorDangerButtonPressed],
    label: colorDangerButtonText,
    labelDisabled: colorDangerButtonTextDisabled
  },
  white: {
    default: IOColors[colorWhiteButtonDefault],
    pressed: IOColors[colorWhiteButtonPressed],
    label: colorWhiteButtonText,
    labelDisabled: colorWhiteButtonTextDisabled
  }
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    textAlignVertical: "center", // Android
    justifyContent: "center",
    // Legacy visual properties
    borderRadius: themeVariables.btnBorderRadius,
    paddingHorizontal: 16,
    // Reset default visual parameters
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 0
    // Visual parameters based on the FontScale
    // paddingVertical: PixelRatio.getFontScale() * 10,
    // paddingHorizontal: PixelRatio.getFontScale() * 16,
    // borderRadius: PixelRatio.getFontScale() * 8
  },
  /* Color States */
  colorDisabled: {
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
  accessibilityHint
}: Props) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.basicButton?.pressedState;

  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const pressedAnimationStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [mapColorStates[color].default, mapColorStates[color].pressed]
    );

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
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      disabled={disabled}
      style={
        fullWidth
          ? IOButtonStyles.dimensionsFullWidth
          : IOButtonStyles.dimensionsDefault
      }
    >
      <Animated.View
        style={[
          styles.button,
          small
            ? IOButtonStyles.buttonSizeSmall
            : IOButtonStyles.buttonSizeDefault,
          disabled
            ? styles.colorDisabled
            : { backgroundColor: mapColorStates[color].default },
          // Avoid background color overrides with Reanimated
          !disabled && pressedAnimationStyle
        ]}
      >
        <BaseTypography
          weight={"Bold"}
          color={
            disabled
              ? mapColorStates[color].labelDisabled
              : mapColorStates[color].label
          }
          style={[
            IOButtonStyles.label,
            small
              ? IOButtonStyles.labelSizeSmall
              : IOButtonStyles.labelSizeDefault
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
          // allowFontScaling
          // maxFontSizeMultiplier={1.3}
        >
          {label}
        </BaseTypography>
      </Animated.View>
    </Pressable>
  );
};

export default ButtonSolid;
