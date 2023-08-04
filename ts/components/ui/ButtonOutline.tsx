import {
  ButtonOutline as DSButtonOutline,
  AnimatedIcon,
  IOIconSizeScale,
  IOIcons,
  IconClassComponent
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback } from "react";
import {
  GestureResponderEvent,
  // PixelRatio
  Pressable,
  StyleSheet
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { makeFontStyleObject } from "../core/fonts";
import { WithTestID } from "../../types/WithTestID";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { HSpacer } from "../core/spacer/Spacer";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import {
  IOButtonLegacyStyles,
  IOButtonStyles
} from "../core/variables/IOStyles";

export type ButtonOutline = WithTestID<{
  color?: "primary" | "neutral" | "contrast" | "danger";
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

/*
░░░ COMPONENT CONFIGURATION ░░░
*/

const mapLegacyColorStates: Record<
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

const IOButtonLegacyStylesLocal = StyleSheet.create({
  label: {
    ...makeFontStyleObject("Bold")
  },
  buttonWithBorder: {
    borderWidth: 1
  }
});

const DISABLED_OPACITY = 0.5;

/**
 *
 * The `ButtonOutline` component is a customizable outline-style button that provides the option to
 * display a label and an optional icon. It supports animated scaling and color changes when pressed.
 * Currently if the Design System is enabled, the component returns the ButtonOutline of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @property {string} color - The color of the button. Possible values are: "primary", "secondary", "success", "danger", "warning", "info", etc.
 * @property {string} label - The label text displayed on the button.
 * @property {boolean} small - If `true`, the button will be rendered with a smaller size.
 * @property {boolean} fullWidth - If `true`, the button will occupy the full width of its container.
 * @property {boolean} disabled - If `true`, the button will be disabled and not respond to user interactions.
 * @property {string} icon - The name of the icon to be displayed on the button (optional).
 * @property {string} iconPosition - The position of the icon relative to the label. Possible values are: "start" (before the label) or "end" (after the label).
 * @property {function} onPress - The callback function to be executed when the button is pressed.
 * @property {string} accessibilityLabel - An accessibility label for the button.
 * @property {string} accessibilityHint - An accessibility hint for the button.
 * @property {string} testID - A test identifier for the button, used for testing purposes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ButtonOutline of the @pagopa/io-app-design-system library.
 *
 */
export const ButtonOutline = ({
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
ButtonOutline) => {
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

    const backgroundColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapLegacyColorStates[color].background.default,
        mapLegacyColorStates[color].background.pressed
      ]
    );

    const borderColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapLegacyColorStates[color].border.default,
        mapLegacyColorStates[color].border.pressed
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
      [
        mapLegacyColorStates[color].label.default,
        mapLegacyColorStates[color].label.pressed
      ]
    );

    return {
      color: labelColor
    };
  });

  // Animate the <Icon> color prop
  const pressedColorIconAnimationStyle = useAnimatedProps(() => {
    const iconColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapLegacyColorStates[color].label.default,
        mapLegacyColorStates[color].label.pressed
      ]
    );
    return { color: iconColor };
  });

  const AnimatedIconClassComponent =
    Animated.createAnimatedComponent(IconClassComponent);

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

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
          IOButtonLegacyStylesLocal.buttonWithBorder,
          iconPosition === "end" && { flexDirection: "row-reverse" },
          small
            ? IOButtonLegacyStyles.buttonSizeSmall
            : IOButtonLegacyStyles.buttonSizeDefault,
          disabled
            ? {
                backgroundColor:
                  mapLegacyColorStates[color]?.background?.disabled,
                borderColor: mapLegacyColorStates[color]?.border?.disabled,
                opacity: DISABLED_OPACITY
              }
            : {
                backgroundColor:
                  mapLegacyColorStates[color]?.background?.default,
                borderColor: mapLegacyColorStates[color]?.border.default
              },
          /* Prevent Reanimated from overriding background colors
          if button is disabled */
          !disabled && pressedAnimationStyle
        ]}
      >
        {icon && (
          <>
            {!disabled ? (
              <AnimatedIconClassComponent
                name={icon}
                animatedProps={pressedColorIconAnimationStyle}
                color={mapLegacyColorStates[color]?.label?.default}
                size={iconSize}
              />
            ) : (
              <AnimatedIcon
                name={icon}
                size={iconSize}
                color={mapLegacyColorStates[color]?.label?.disabled}
              />
            )}
            <HSpacer size={8} />
          </>
        )}
        <Animated.Text
          style={[
            IOButtonLegacyStylesLocal.label,
            IOButtonLegacyStyles.label,
            small
              ? IOButtonLegacyStyles.labelSizeSmall
              : IOButtonLegacyStyles.labelSizeDefault,
            disabled
              ? { color: mapLegacyColorStates[color]?.label?.disabled }
              : { color: mapLegacyColorStates[color]?.label?.default },
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

  return isDesignSystemEnabled ? (
    <DSButtonOutline
      label={label}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      accessibilityHint={accessibilityHint}
      testID={testID}
      disabled={disabled}
      color={color}
      fullWidth={fullWidth}
      small={small}
      icon={icon}
      iconPosition={iconPosition}
    />
  ) : (
    <LegacyButton />
  );
};

export default ButtonOutline;
