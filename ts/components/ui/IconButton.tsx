import { IconButton as DSIconButton } from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback } from "react";
import { GestureResponderEvent, Pressable } from "react-native";
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
import { WithTestID } from "../../types/WithTestID";
import { AnimatedIcon, IOIcons, IconClassComponent } from "../core/icons";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { IOIconButtonStyles } from "../core/variables/IOStyles";
export type IconButton = WithTestID<{
  color?: "primary" | "neutral" | "contrast";
  icon: IOIcons;
  disabled?: boolean;
  // Accessibility
  accessibilityLabel: string;
  accessibilityHint?: string;
  // Events
  onPress: (event: GestureResponderEvent) => void;
}>;

type ColorStates = {
  icon: {
    default: string;
    pressed: string;
    disabled: string;
  };
};

/*
░░░ COMPONENT CONFIGURATION ░░░
*/

const mapLegacyColorStates: Record<
  NonNullable<IconButton["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    icon: {
      default: IOColors.blue,
      pressed: IOColors["blue-600"],
      disabled: hexToRgba(IOColors.blue, 0.25)
    }
  },
  // Neutral button
  neutral: {
    icon: {
      default: IOColors.black,
      pressed: IOColors.bluegreyDark,
      disabled: IOColors.grey
    }
  },
  // Contrast button
  contrast: {
    icon: {
      default: IOColors.white,
      pressed: hexToRgba(IOColors.white, 0.85),
      disabled: hexToRgba(IOColors.white, 0.25)
    }
  }
};

const AnimatedIconClassComponent =
  Animated.createAnimatedComponent(IconClassComponent);

/**
 *
 * The `IconButton` component is a customizable button that displays an icon. It supports animated scaling
 * and color changes when pressed. Currently if the Design System is enabled, the component returns the IconButton of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @property {string} color - The color of the button. Possible values are: "primary", "secondary", "success", "danger", "warning", "info", etc.
 * @property {string} icon - The name of the icon to be displayed on the button.
 * @property {boolean} disabled - If `true`, the button will be disabled and not respond to user interactions.
 * @property {function} onPress - The callback function to be executed when the button is pressed.
 * @property {string} accessibilityLabel - An accessibility label for the button.
 * @property {string} accessibilityHint - An accessibility hint for the button.
 * @property {string} testID - A test identifier for the button, used for testing purposes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the IconButton of the @pagopa/io-app-design-system library.
 *
 */
export const IconButton = ({
  color = "primary",
  icon,
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: IconButton) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.exaggeratedButton?.pressedState;

  // Using a spring-based animation for our interpolations
  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values

  const pressedAnimationStyle = useAnimatedStyle(() => {
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

  // Animate the <Icon> color prop
  const animatedColor = useAnimatedProps(() => {
    const iconColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapLegacyColorStates[color].icon.default,
        mapLegacyColorStates[color].icon.pressed
      ]
    );
    return { color: iconColor };
  });

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  const LegacyIconButton = () => (
    <Pressable
      disabled={disabled}
      // Events
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      // Accessibility
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      // Usability
      // Add a touchable area around the button
      hitSlop={8}
      // Test
      testID={testID}
    >
      <Animated.View
        style={[
          IOIconButtonStyles.buttonSizeSmall,
          !disabled && pressedAnimationStyle
        ]}
      >
        {!disabled ? (
          <AnimatedIconClassComponent
            name={icon}
            animatedProps={animatedColor}
            color={mapLegacyColorStates[color]?.icon?.default}
          />
        ) : (
          <AnimatedIcon
            name={icon}
            color={mapLegacyColorStates[color]?.icon?.disabled}
          />
        )}
      </Animated.View>
    </Pressable>
  );
  return isDesignSystemEnabled ? (
    <DSIconButton
      icon={icon}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={testID}
      disabled={disabled}
      accessibilityHint={accessibilityHint}
      color={color}
    />
  ) : (
    <LegacyIconButton />
  );
};

export default IconButton;
