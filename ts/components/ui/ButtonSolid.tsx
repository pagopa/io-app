import * as React from "react";
import { useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  PixelRatio,
  ColorValue,
  TextStyle
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

type Props = {
  color?: "primary" | "danger";
  label: string;
  small?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: (event: GestureResponderEvent) => void;
};

// Button visual props
const fontSizeDefault: TextStyle["fontSize"] = 16;
const fontSizeSmall: TextStyle["fontSize"] = 14;
// -- Primary Button
const colorPrimaryButtonDefault: ColorValue = IOColors.blue;
const colorPrimaryButtonPressed: ColorValue = IOColors.blueUltraLight;
// -- Danger Button
const colorDangerButtonDefault: ColorValue = IOColors.red;
const colorDangerButtonPressed: ColorValue = IOColors.red;
// -- Disabled state
const colorPrimaryButtonDisabled: ColorValue = IOColors.bluegreyLight;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    textAlignVertical: "center", // Android
    justifyContent: "center",

    // Visual parameters based on the FontScale
    paddingVertical: PixelRatio.getFontScale() * 10,
    paddingHorizontal: PixelRatio.getFontScale() * 16,
    borderRadius: PixelRatio.getFontScale() * 8
  },
  /* Color styles */
  colorDefault: {
    backgroundColor: colorPrimaryButtonDefault
  },
  colorDisabled: {
    backgroundColor: colorPrimaryButtonDisabled
  },
  /* Font Size */
  label: {
    alignSelf: "center"
  },
  labelSizeDefault: {
    fontSize: fontSizeDefault
  },
  labelSizeSmall: {
    fontSize: fontSizeSmall
  },
  /* Dimensions */
  dimensionsDefault: {
    alignSelf: "flex-start"
  },
  dimensionsFullWidth: {
    flex: 1,
    alignSelf: "auto"
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

  const scaleTraversed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const animatedStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      scaleTraversed.value,
      [0, 1],
      [colorPrimaryButtonDefault, colorPrimaryButtonPressed]
    );

    const scale = interpolate(
      scaleTraversed.value,
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
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      disabled={disabled}
      accessibilityRole={"button"}
      style={fullWidth ? styles.dimensionsFullWidth : styles.dimensionsDefault}
    >
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          disabled ? styles.colorDisabled : styles.colorDefault
        ]}
      >
        <BaseTypography
          weight={"Bold"}
          color={"white"}
          style={[
            styles.label,
            small ? styles.labelSizeSmall : styles.labelSizeDefault
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </BaseTypography>
      </Animated.View>
    </Pressable>
  );
};

export default ButtonSolid;
