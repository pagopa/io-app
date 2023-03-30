import * as React from "react";
import { useCallback } from "react";
import { Pressable, GestureResponderEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate,
  interpolateColor
} from "react-native-reanimated";
import { hexToRgba, IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { IOButtonStyles, IOIconButtonStyles } from "../core/variables/IOStyles";
import { AnimatedIcon, IOIcons } from "../core/icons";
import { WithTestID } from "../../types/WithTestID";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

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

/*
░░░ COMPONENT CONFIGURATION ░░░
*/

/* Delete the following block if you want to
get rid of legacy variant */

/* ◀ REMOVE_LEGACY_COMPONENT: Start */

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

/* REMOVE_LEGACY_COMPONENT: End ▶ */

const mapColorStates: Record<
  NonNullable<IconButtonSolid["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    background: {
      default: IOColors["blueIO-500"],
      pressed: IOColors["blueIO-600"],
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
      pressed: IOColors["blueIO-50"],
      disabled: hexToRgba(IOColors.white, 0.25)
    },
    icon: {
      default: IOColors["blueIO-500"],
      disabled: IOColors["blueIO-500"]
    }
  }
};

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

  const NewButton = () => (
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
                backgroundColor: mapColorStates[color]?.background?.disabled
              }
            : {
                backgroundColor: mapColorStates[color]?.background?.default
              }
        ]}
      >
        <AnimatedIcon
          name={icon}
          color={
            !disabled
              ? mapColorStates[color]?.icon?.default
              : mapColorStates[color]?.icon?.disabled
          }
        />
      </Animated.View>
    </Pressable>
  );

  /* ◀ REMOVE_LEGACY_COMPONENT: Move the entire <NewButton /> here,
  without the following condition */
  return isDesignSystemEnabled ? <NewButton /> : <LegacyButton />;
};

export default IconButtonSolid;
