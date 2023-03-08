import * as React from "react";
import { useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent
  // PixelRatio
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
import {
  IOButtonStyles,
  IOButtonLegacyStyles
} from "../core/variables/IOStyles";
import { WithTestID } from "../../types/WithTestID";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

export type ButtonSolid = WithTestID<{
  color?: "primary" | "danger" | "contrast";
  label: string;
  small?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
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

/* Delete the following block if you want to
get rid of legacy variant */

/* ◀ REMOVE_LEGACY_COMPONENT: Start */

const mapLegacyColorStates: Record<
  NonNullable<ButtonSolid["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    default: IOColors.blue,
    pressed: IOColors.blue600,
    label: {
      default: "white",
      disabled: "white"
    }
  },
  // Danger button
  danger: {
    default: IOColors.errorGraphic,
    pressed: IOColors.errorDark,
    label: {
      default: "white",
      disabled: "white"
    }
  },
  // Contrast button
  contrast: {
    default: IOColors.white,
    pressed: IOColors.blue50,
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

/* REMOVE_LEGACY_COMPONENT: End ▶ */

// Disabled state
const colorPrimaryButtonDisabled: IOColors = "grey200";

const styles = StyleSheet.create({
  backgroundDisabled: {
    backgroundColor: IOColors[colorPrimaryButtonDisabled]
  }
});

const mapColorStates: Record<NonNullable<ButtonSolid["color"]>, ColorStates> = {
  // Primary button
  primary: {
    default: IOColors.blueNew,
    pressed: IOColors.blueNew600,
    label: {
      default: "white",
      disabled: "grey700"
    }
  },
  // Danger button
  danger: {
    default: IOColors.errorDark,
    pressed: IOColors.errorGraphic,
    label: {
      default: "white",
      disabled: "grey700"
    }
  },
  // Contrast button
  contrast: {
    default: IOColors.white,
    pressed: IOColors.blueNew50,
    label: {
      default: "blueNew",
      disabled: "grey700"
    }
  }
};

export const ButtonSolid = ({
  color = "primary",
  label,
  small = false,
  fullWidth = false,
  disabled = false,
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

    /* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
    const bgColor = isDesignSystemEnabled
      ? interpolateColor(
          progressPressed.value,
          [0, 1],
          [mapColorStates[color].default, mapColorStates[color].pressed]
        )
      : interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapLegacyColorStates[color].default,
            mapLegacyColorStates[color].pressed
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

  /* ◀ REMOVE_LEGACY_COMPONENT: Start */
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
      style={
        fullWidth
          ? IOButtonLegacyStyles.dimensionsFullWidth
          : IOButtonLegacyStyles.dimensionsDefault
      }
    >
      <Animated.View
        style={[
          IOButtonLegacyStyles.button,
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
        <BaseTypography
          weight={"Bold"}
          color={
            disabled
              ? mapLegacyColorStates[color]?.label?.disabled
              : mapLegacyColorStates[color]?.label?.default
          }
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
      style={
        fullWidth
          ? IOButtonStyles.dimensionsFullWidth
          : IOButtonStyles.dimensionsDefault
      }
    >
      <Animated.View
        style={[
          IOButtonStyles.button,
          small
            ? IOButtonStyles.buttonSizeSmall
            : IOButtonStyles.buttonSizeDefault,
          disabled
            ? styles.backgroundDisabled
            : { backgroundColor: mapColorStates[color]?.default },
          /* Prevent Reanimated from overriding background colors
          if button is disabled */
          !disabled && pressedAnimationStyle
        ]}
      >
        <BaseTypography
          font="ReadexPro"
          weight={"Regular"}
          color={
            disabled
              ? mapColorStates[color]?.label?.disabled
              : mapColorStates[color]?.label?.default
          }
          style={[
            IOButtonStyles.label,
            small
              ? IOButtonStyles.labelSizeSmall
              : IOButtonStyles.labelSizeDefault
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

  /* ◀ REMOVE_LEGACY_COMPONENT: Move the entire <NewButton /> here,
  without the following condition */
  return isDesignSystemEnabled ? <NewButton /> : <LegacyButton />;
};

export default ButtonSolid;
