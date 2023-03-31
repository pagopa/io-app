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

/* Delete the following block if you want to
get rid of legacy variant */

/* ◀ REMOVE_LEGACY_COMPONENT: Start */

const mapLegacyColorStates: Record<
  NonNullable<IconButton["color"]>,
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

/* REMOVE_LEGACY_COMPONENT: End ▶ */

const mapColorStates: Record<NonNullable<IconButton["color"]>, ColorStates> = {
  // Primary button
  primary: {
    background: {
      default: hexToRgba(IOColors["blueIO-500"], 0),
      pressed: hexToRgba(IOColors["blueIO-500"], 0.15),
      disabled: "transparent"
    },
    icon: {
      default: IOColors["blueIO-500"],
      pressed: IOColors["blueIO-600"],
      disabled: hexToRgba(IOColors["blueIO-500"], 0.25)
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

export const IconButton = ({
  icon,
  color = "primary",
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
    // Link color states to the pressed states
    /* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
    const backgroundColor = isDesignSystemEnabled
      ? interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapColorStates[color].background.default,
            mapColorStates[color].background.pressed
          ]
        )
      : interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapLegacyColorStates[color].background.default,
            mapLegacyColorStates[color].background.pressed
          ]
        );
    /* REMOVE_LEGACY_COMPONENT: End ▶ */

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
