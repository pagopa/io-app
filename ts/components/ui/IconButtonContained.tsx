import {
  IconButtonContained as DSIconButtonContained,
  AnimatedIcon,
  IconClassComponent,
  IOIcons,
  IOColors,
  hexToRgba,
  IOScaleValues,
  IOSpringValues
} from "@pagopa/io-app-design-system";
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
import { IOButtonStyles, IOIconButtonStyles } from "../core/variables/IOStyles";
export type IconButtonContained = WithTestID<{
  icon: IOIcons;
  color?: "primary" | "neutral" | "contrast";
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: (event: GestureResponderEvent) => void;
}>;

type ColorStates = {
  background: {
    default: string;
    pressed: string;
    disabled: string;
  };
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
  NonNullable<IconButtonContained["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    background: {
      default: hexToRgba(IOColors.blue, 0),
      pressed: hexToRgba(IOColors.blue, 0.15),
      disabled: "transparent"
    },
    icon: {
      default: IOColors.blue,
      pressed: IOColors.blue,
      disabled: hexToRgba(IOColors.blue, 0.25)
    }
  },
  // Neutral button
  neutral: {
    background: {
      default: IOColors.white,
      pressed: IOColors.greyUltraLight,
      disabled: "transparent"
    },
    icon: {
      default: IOColors.bluegrey,
      pressed: IOColors.black,
      disabled: IOColors.grey
    }
  },
  // Contrast button
  contrast: {
    background: {
      default: hexToRgba(IOColors.white, 0),
      pressed: hexToRgba(IOColors.white, 0.2),
      disabled: "transparent"
    },
    icon: {
      default: IOColors.white,
      pressed: IOColors.white,
      disabled: hexToRgba(IOColors.white, 0.25)
    }
  }
};

const AnimatedIconClassComponent =
  Animated.createAnimatedComponent(IconClassComponent);

/**
 *
 * The `IconButtonContained` component is a customizable button that displays an icon inside a solid background.
 * It supports animated scaling and color changes when pressed. Currently if the Design System is enabled, the component returns the IconButtonContained of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @property {string} icon - The name of the icon to be displayed on the button.
 * @property {string} color - The color of the button. Possible values are: "primary", "secondary", "success", "danger", "warning", "info", etc.
 * @property {boolean} disabled - If `true`, the button will be disabled and not respond to user interactions.
 * @property {function} onPress - The callback function to be executed when the button is pressed.
 * @property {string} accessibilityLabel - An accessibility label for the button.
 * @property {string} accessibilityHint - An accessibility hint for the button.
 * @property {string} testID - A test identifier for the button, used for testing purposes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the the IconButtonContained of the @pagopa/io-app-design-system library.
 *
 */
export const IconButtonContained = ({
  icon,
  color = "primary",
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: IconButtonContained) => {
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
    const backgroundColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [
        mapLegacyColorStates[color].background.default,
        mapLegacyColorStates[color].background.pressed
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
      backgroundColor,
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
      style={IOButtonStyles.dimensionsDefault}
    >
      <Animated.View
        style={[
          IOIconButtonStyles.button,
          IOIconButtonStyles.buttonSizeDefault,
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
    <DSIconButtonContained
      icon={icon}
      color={color}
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
    />
  ) : (
    <LegacyButton />
  );
};

export default IconButtonContained;
