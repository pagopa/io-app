import {
  ButtonLink as DSButtonLink,
  AnimatedIcon,
  IOIconSizeScale,
  IOIcons,
  IconClassComponent,
  IOColors,
  HSpacer,
  IOScaleValues,
  IOSpringValues
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
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { makeFontStyleObject } from "../core/fonts";
import { WithTestID } from "../../types/WithTestID";
import { IOButtonStyles } from "../core/variables/IOStyles";

export type ButtonLink = WithTestID<{
  color?: "primary";
  label: string;
  disabled?: boolean;
  // Icons
  icon?: IOIcons;
  iconPosition?: "start" | "end";
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  // Events
  onPress: (event: GestureResponderEvent) => void;
}>;

type ColorStates = {
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
  NonNullable<ButtonLink["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    label: {
      default: IOColors.blue,
      pressed: IOColors["blue-600"],
      disabled: IOColors["grey-700"]
    }
  }
};

const IOButtonLegacyStylesLocal = StyleSheet.create({
  label: {
    fontSize: 16,
    ...makeFontStyleObject("Bold", false, "TitilliumWeb")
  }
});

const mapColorStates: Record<NonNullable<ButtonLink["color"]>, ColorStates> = {
  // Primary button
  primary: {
    label: {
      default: IOColors["blueIO-500"],
      pressed: IOColors["blueIO-600"],
      disabled: IOColors["grey-700"]
    }
  }
};

const DISABLED_OPACITY = 0.5;

/**
 *
 * The `ButtonLink` component is a customizable link-style button that provides an extended outline style,
 * allowing the display of a label and an optional icon. It supports animated scaling and color changes
 * when pressed.
 * Currently if the Design System is enabled, the component returns the ButtonLink of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @property {string} color - The color of the button. Possible values are: "primary", "secondary", "success", "danger", "warning", "info", etc.
 * @property {string} label - The label text displayed on the button.
 * @property {boolean} disabled - If `true`, the button will be disabled and not respond to user interactions.
 * @property {string} icon - The name of the icon to be displayed on the button (optional).
 * @property {string} iconPosition - The position of the icon relative to the label. Possible values are: "start" (before the label) or "end" (after the label).
 * @property {function} onPress - The callback function to be executed when the button is pressed.
 * @property {string} accessibilityLabel - An accessibility label for the button.
 * @property {string} accessibilityHint - An accessibility hint for the button.
 * @property {string} testID - A test identifier for the button, used for testing purposes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ButtonLink of the @pagopa/io-app-design-system library.
 *
 */
export const ButtonLink = ({
  color = "primary",
  label,
  disabled = false,
  icon,
  iconPosition = "start",
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: // eslint-disable-next-line sonarjs/cognitive-complexity
ButtonLink) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
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

    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
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
  const iconSize: IOIconSizeScale = 24;

  const LegacyButton = () => (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessible={true}
      disabled={disabled}
      hitSlop={{ top: 14, right: 24, bottom: 14, left: 24 }}
      style={IOButtonStyles.dimensionsDefault}
    >
      <Animated.View
        style={[
          IOButtonStyles.buttonLink,
          iconPosition === "end" && { flexDirection: "row-reverse" },
          disabled ? { opacity: DISABLED_OPACITY } : {},
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
                color={mapColorStates[color]?.label?.disabled}
                size={iconSize}
              />
            )}
            <HSpacer size={8} />
          </>
        )}
        <Animated.Text
          style={[
            IOButtonLegacyStylesLocal.label,
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
  return isDesignSystemEnabled ? (
    <DSButtonLink
      label={label}
      onPress={onPress}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      color={color}
      disabled={disabled}
      icon={icon}
      iconPosition={iconPosition}
      testID={testID}
    />
  ) : (
    <LegacyButton />
  );
};

export default ButtonLink;
