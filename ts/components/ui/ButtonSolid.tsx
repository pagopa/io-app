import {
  ButtonSolid as DSButton,
  IOColors,
  IOIconSizeScale,
  IOIcons,
  Icon,
  HSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback } from "react";
import { GestureResponderEvent, Pressable, StyleSheet } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { WithTestID } from "../../types/WithTestID";
import { BaseTypography } from "../core/typography/BaseTypography";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import {
  IOButtonLegacyStyles,
  IOButtonStyles
} from "../core/variables/IOStyles";

export type ButtonSolid = WithTestID<{
  color?: "primary" | "danger" | "contrast";
  label: string;
  small?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  // Icons
  icon?: IOIcons;
  iconPosition?: "start" | "end";
  // Accessibility
  accessibilityLabel: string;
  accessibilityHint?: string;
  // Events
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

/*
░░░ COMPONENT CONFIGURATION ░░░
*/

const mapLegacyColorStates: Record<
  NonNullable<ButtonSolid["color"]>,
  ColorStates
> = {
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
const colorPrimaryLegacyButtonDisabled: IOColors = "bluegreyLight";
const legacyStyles = StyleSheet.create({
  backgroundDisabled: {
    backgroundColor: IOColors[colorPrimaryLegacyButtonDisabled]
  }
});

/**
 * ButtonSolid Component
 *
 * The `ButtonSolid` component is a reusable button component that provides a solid-colored button
 * with customizable properties, such as color, label, icon, size, and press animations.
 * Currently if the Design System is enabled, the component returns the Button of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @property {string} color - The color of the button. Possible values are: "primary", "secondary", "success", "danger", "warning", "info", etc.
 * @property {string} label - The label text displayed on the button.
 * @property {boolean} small - If `true`, the button will be rendered with a smaller size.
 * @property {boolean} fullWidth - If `true`, the button will occupy the full width of its container.
 * @property {boolean} disabled - If `true`, the button will be disabled and not respond to user interactions.
 * @property {string} icon - The name of the icon to be displayed on the button.
 * @property {string} iconPosition - The position of the icon relative to the label. Possible values are: "start" (before the label) or "end" (after the label).
 * @property {function} onPress - The callback function to be executed when the button is pressed.
 * @property {string} accessibilityLabel - An accessibility label for the button.
 * @property {string} accessibilityHint - An accessibility hint for the button.
 * @property {string} testID - A test identifier for the button, used for testing purposes.
 *
 * @deprecated Use of this component is discouraged. It is being replaced by the Button of the @pagopa/io-app-design-system library.
 *
 */
export const ButtonSolid = ({
  color = "primary",
  label,
  small = false,
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = "start",
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: // eslint-disable-next-line sonarjs/cognitive-complexity
ButtonSolid) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

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
      [mapLegacyColorStates[color].default, mapLegacyColorStates[color].pressed]
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

  // Label & Icons colors
  const foregroundLegacyColor: IOColors = disabled
    ? mapLegacyColorStates[color]?.label?.disabled
    : mapLegacyColorStates[color]?.label?.default;

  // Icon size
  const iconSize: IOIconSizeScale = small ? 16 : 20;

  const LegacyButton = () => (
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
          IOButtonLegacyStyles.button,
          iconPosition === "end" && { flexDirection: "row-reverse" },
          small
            ? IOButtonLegacyStyles.buttonSizeSmall
            : IOButtonLegacyStyles.buttonSizeDefault,
          disabled
            ? legacyStyles.backgroundDisabled
            : { backgroundColor: mapLegacyColorStates[color]?.default },
          /* Prevent Reanimated from overriding background colors
          if button is disabled */
          !disabled && pressedAnimationStyle
        ]}
      >
        {icon && (
          <>
            <Icon name={icon} size={iconSize} color={foregroundLegacyColor} />
            <HSpacer size={8} />
          </>
        )}
        <BaseTypography
          weight={"Bold"}
          color={foregroundLegacyColor}
          style={[
            IOButtonLegacyStyles.label,
            small
              ? IOButtonLegacyStyles.labelSizeSmall
              : IOButtonLegacyStyles.labelSizeDefault
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
  /* REMOVE_LEGACY_COMPONENT: End ▶ */

  return isDesignSystemEnabled ? (
    <DSButton
      label={label}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      accessibilityHint={accessibilityHint}
      color={color}
      disabled={disabled}
      fullWidth={fullWidth}
      icon={icon}
      iconPosition={iconPosition}
      small={small}
      testID={testID}
    />
  ) : (
    <LegacyButton />
  );
};

export default ButtonSolid;
