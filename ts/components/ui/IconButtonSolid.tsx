import {
  IconButtonSolid as DSIconButtonSolid,
  AnimatedIcon,
  IOIcons
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useCallback } from "react";
import { GestureResponderEvent, Pressable } from "react-native";
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
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { IOButtonStyles, IOIconButtonStyles } from "../core/variables/IOStyles";

export type IconButtonSolid = WithTestID<{
  icon: IOIcons;
  color?: "primary" | "contrast";
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
    disabled: string;
  };
};

const mapLegacyColorStates: Record<
  NonNullable<IconButtonSolid["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    background: {
      default: IOColors.blue,
      pressed: IOColors["blue-600"],
      disabled: IOColors["grey-100"]
    },
    icon: {
      default: IOColors.white,
      disabled: IOColors["grey-450"]
    }
  },
  contrast: {
    background: {
      default: IOColors.white,
      pressed: IOColors["blue-50"],
      disabled: hexToRgba(IOColors.white, 0.25)
    },
    icon: {
      default: IOColors.blue,
      disabled: IOColors.blue
    }
  }
};

/**
 *
 * The `IconButtonSolid` component represents a solid icon button with various customizable options,
 * such as color, icon, and onPress behavior. It displays an icon within a solid rounded container with a background color
 * that changes when pressed. Currently if the Design System is enabled, the component returns the IconButtonSolid of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @property {string} icon - The name of the icon to be displayed in the button. It should be a valid icon name
 * supported by the Icon component.
 * @property {string} [color="primary"] - The color of the button. It can be one of the predefined color options
 * supported by the component, such as "primary", "secondary", "success", "danger", etc.
 * @property {boolean} [disabled=false] - If set to true, the button will be in a disabled state and will not respond
 * to user interactions.
 * @property {function} onPress - The callback function to be executed when the button is pressed. It allows you
 * to define custom behavior when the button is interacted with, such as handling click events.
 * @property {string} [accessibilityLabel] - A label that describes the button for accessibility purposes.
 * It is read by screen readers to provide context and information to users with visual impairments.
 * @property {string} [accessibilityHint] - A brief hint that describes the expected action of the button for accessibility
 * purposes. It is read by screen readers to provide additional information about the button's purpose.
 * @property {string} [testID] - An identifier used to locate this component in tests.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the the IconButtonSolid of the @pagopa/io-app-design-system library.
 */
export const IconButtonSolid = ({
  icon,
  color = "primary",
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: IconButtonSolid) => {
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
    // Link color states to the pressed states
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
          IOIconButtonStyles.buttonSizeLarge,
          !disabled && pressedAnimationStyle,
          disabled
            ? {
                backgroundColor:
                  mapLegacyColorStates[color]?.background?.disabled
              }
            : {
                backgroundColor:
                  mapLegacyColorStates[color]?.background?.default
              }
        ]}
      >
        <AnimatedIcon
          name={icon}
          color={
            !disabled
              ? mapLegacyColorStates[color]?.icon?.default
              : mapLegacyColorStates[color]?.icon?.disabled
          }
        />
      </Animated.View>
    </Pressable>
  );

  return isDesignSystemEnabled ? (
    <DSIconButtonSolid
      icon={icon}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      accessibilityHint={accessibilityHint}
      color={color}
      disabled={disabled}
      testID={testID}
    />
  ) : (
    <LegacyButton />
  );
};

export default IconButtonSolid;
