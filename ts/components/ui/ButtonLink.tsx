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
import { IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { IOButtonStyles } from "../core/variables/IOStyles";
import { makeFontStyleObject } from "../core/fonts";
import { WithTestID } from "../../types/WithTestID";
import {
  AnimatedIcon,
  IOIconSizeScale,
  IOIcons,
  IconClassComponent
} from "../core/icons/Icon";
import { HSpacer } from "../core/spacer/Spacer";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

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

/* Delete the following block if you want to
get rid of legacy variant */

/* ◀ REMOVE_LEGACY_COMPONENT: Start */

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

/* REMOVE_LEGACY_COMPONENT: End ▶ */

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

const IOButtonStylesLocal = StyleSheet.create({
  label: {
    fontSize: 16,
    ...makeFontStyleObject("Regular", false, "ReadexPro")
  }
});

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

    /* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */
    const labelColor = isDesignSystemEnabled
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
    /* REMOVE_LEGACY_COMPONENT: End ▶ */

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
                color={
                  isDesignSystemEnabled
                    ? mapColorStates[color]?.label?.default
                    : mapLegacyColorStates[color]?.label?.default
                }
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
            isDesignSystemEnabled
              ? IOButtonStylesLocal.label
              : IOButtonLegacyStylesLocal.label,
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
};

export default ButtonLink;
