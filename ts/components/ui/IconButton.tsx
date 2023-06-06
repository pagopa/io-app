import * as React from "react";
import { useCallback } from "react";
import { Pressable, GestureResponderEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate,
  interpolateColor
} from "react-native-reanimated";
import { hexToRgba, IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { IOButtonStyles, IOIconButtonStyles } from "../core/variables/IOStyles";
import { AnimatedIcon, IconClassComponent, IOIcons } from "../core/icons";
import { WithTestID } from "../../types/WithTestID";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

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

/* Delete the following block if you want to
get rid of legacy variant */

/* ◀ REMOVE_LEGACY_COMPONENT: Start */

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

/* REMOVE_LEGACY_COMPONENT: End ▶ */

const mapColorStates: Record<NonNullable<IconButton["color"]>, ColorStates> = {
  // Primary button
  primary: {
    icon: {
      default: IOColors["blueIO-500"],
      pressed: IOColors["blueIO-600"],
      disabled: hexToRgba(IOColors["blueIO-500"], 0.25)
    }
  },
  // Neutral button
  neutral: {
    icon: {
      default: IOColors.black,
      pressed: IOColors["grey-850"],
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
    /* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
    const iconColor = isDesignSystemEnabled
      ? interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapColorStates[color].icon.default,
            mapColorStates[color].icon.pressed
          ]
        )
      : interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapLegacyColorStates[color].icon.default,
            mapLegacyColorStates[color].icon.pressed
          ]
        );
    return { color: iconColor };
  });
  /* REMOVE_LEGACY_COMPONENT: End ▶ */

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
      style={IOButtonStyles.dimensionsDefault}
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
        {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */}
        {isDesignSystemEnabled ? (
          !disabled ? (
            <AnimatedIconClassComponent
              name={icon}
              animatedProps={animatedColor}
              color={mapColorStates[color]?.icon?.default}
            />
          ) : (
            <AnimatedIcon
              name={icon}
              color={mapColorStates[color]?.icon?.disabled}
            />
          )
        ) : !disabled ? (
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
        {/* REMOVE_LEGACY_COMPONENT: End ▶ */}
      </Animated.View>
    </Pressable>
  );
};

export default IconButton;
