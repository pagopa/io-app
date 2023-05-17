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
  interpolateColor,
  useAnimatedProps
} from "react-native-reanimated";
import { hexToRgba, IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import {
  IOButtonStyles,
  IOButtonLegacyStyles
} from "../core/variables/IOStyles";
import { makeFontStyleObject } from "../core/fonts";
import { WithTestID } from "../../types/WithTestID";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { AnimatedIcon, IOIcons, IconClassComponent } from "../core/icons/Icon";
import { HSpacer } from "../core/spacer/Spacer";

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

/* Delete the following block if you want to
get rid of legacy variant */

/* ◀ REMOVE_LEGACY_COMPONENT: Start */

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

/* REMOVE_LEGACY_COMPONENT: End ▶ */

const mapColorStates: Record<
  NonNullable<ButtonOutline["color"]>,
  ColorStates
> = {
  // Primary button
  primary: {
    border: {
      default: IOColors["blueIO-500"],
      pressed: IOColors["blueIO-600"],
      disabled: IOColors["grey-200"]
    },
    background: {
      default: hexToRgba(IOColors["blueIO-50"], 0),
      pressed: hexToRgba(IOColors["blueIO-50"], 1),
      disabled: "transparent"
    },
    label: {
      default: IOColors["blueIO-500"],
      pressed: IOColors["blueIO-600"],
      disabled: IOColors["grey-700"]
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
      disabled: IOColors["blueIO-200"]
    },
    background: {
      default: hexToRgba(IOColors["blueIO-600"], 0),
      pressed: IOColors["blueIO-600"],
      disabled: "transparent"
    },
    label: {
      default: IOColors.white,
      pressed: IOColors.white,
      disabled: IOColors["blueIO-200"]
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

const DISABLED_OPACITY = 0.5;

const IOButtonStylesLocal = StyleSheet.create({
  label: {
    ...makeFontStyleObject("Regular", false, "ReadexPro")
  },
  buttonWithBorder: {
    borderWidth: 2
  }
});

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

    const borderColor = isDesignSystemEnabled
      ? interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapColorStates[color].border.default,
            mapColorStates[color].border.pressed
          ]
        )
      : interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapLegacyColorStates[color].border.default,
            mapLegacyColorStates[color].border.pressed
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
      borderColor,
      backgroundColor,
      transform: [{ scale }]
    };
  });

  const pressedColorLabelAnimationStyle = useAnimatedStyle(() => {
    // Link color states to the pressed states

    /* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
    const labelColor = isDesignSystemEnabled
      ? interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapColorStates[color].border.default,
            mapColorStates[color].border.pressed
          ]
        )
      : interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapLegacyColorStates[color].label.default,
            mapLegacyColorStates[color].label.pressed
          ]
        );
    /* REMOVE_LEGACY_COMPONENT: End ▶ */

    return {
      color: labelColor
    };
  });

  // Animate the <Icon> color prop
  const pressedColorIconAnimationStyle = useAnimatedProps(() => {
    /* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
    const iconColor = isDesignSystemEnabled
      ? interpolateColor(
          progressPressed.value,
          [0, 1],
          [
            mapColorStates[color].label.default,
            mapColorStates[color].label.pressed
          ]
        )
      : interpolateColor(
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
  const iconSize = small ? 16 : 20;

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
      style={!fullWidth ? IOButtonStyles.dimensionsDefault : {}}
    >
      <Animated.View
        style={[
          IOButtonStyles.button,
          IOButtonStylesLocal.buttonWithBorder,
          iconPosition === "end" && { flexDirection: "row-reverse" },
          small
            ? IOButtonStyles.buttonSizeSmall
            : IOButtonStyles.buttonSizeDefault,
          disabled
            ? {
                backgroundColor: mapColorStates[color]?.background?.disabled,
                borderColor: mapColorStates[color]?.border?.disabled,
                opacity: DISABLED_OPACITY
              }
            : {
                backgroundColor: mapColorStates[color]?.background?.default,
                borderColor: mapColorStates[color]?.border.default
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
                color={mapColorStates[color]?.label?.default}
              />
            ) : (
              <AnimatedIcon
                name={icon}
                color={mapColorStates[color]?.label?.disabled}
              />
            )}
            <HSpacer size={8} />
          </>
        )}
        <Animated.Text
          style={[
            IOButtonStylesLocal.label,
            IOButtonStyles.label,
            small
              ? IOButtonStyles.labelSizeSmall
              : IOButtonStyles.labelSizeDefault,
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

  /* ◀ REMOVE_LEGACY_COMPONENT: Move the entire <NewButton /> here,
  without the following condition */
  return isDesignSystemEnabled ? <NewButton /> : <LegacyButton />;
};

export default ButtonOutline;
