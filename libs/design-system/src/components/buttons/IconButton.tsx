import { GestureResponderEvent, Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useReducedMotion
} from "react-native-reanimated";
import { useIOTheme } from "../../context";
import {
  IOColors,
  IOIconButtonStyles,
  IOThemeLight,
  hexToRgba
} from "../../core";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import {
  AnimatedIcon,
  AnimatedIconWithColorTransition,
  IOIconSizeScale,
  IOIcons
} from "../icons";

export type IconButton = WithTestID<{
  color?: "primary" | "neutral" | "contrast";
  icon: IOIcons;
  iconSize?: IOIconSizeScale;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: (event: GestureResponderEvent) => void;
  persistentColorMode?: boolean;
}>;

type ColorStates = {
  icon: {
    default: string;
    pressed: string;
    disabled: string;
  };
};

export const IconButton = ({
  color = "primary",
  persistentColorMode = false,
  icon,
  iconSize = 24,
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: IconButton) => {
  const theme = useIOTheme();
  const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("exaggerated");
  const reducedMotion = useReducedMotion();

  const mapColorStates: Record<
    NonNullable<IconButton["color"]>,
    ColorStates
  > = {
    // Primary button
    primary: {
      icon: {
        default: IOColors[theme["interactiveElem-default"]],
        pressed: IOColors[theme["interactiveElem-pressed"]],
        disabled: IOColors[theme["interactiveElem-disabled"]]
      }
    },
    // Neutral button
    neutral: {
      icon: {
        default: persistentColorMode
          ? IOColors[IOThemeLight["neutralButton-default"]]
          : IOColors[theme["neutralButton-default"]],
        pressed: persistentColorMode
          ? IOColors[IOThemeLight["neutralButton-pressed"]]
          : IOColors[theme["neutralButton-pressed"]],
        disabled: persistentColorMode
          ? IOColors[IOThemeLight["neutralButton-disabled"]]
          : IOColors[theme["neutralButton-disabled"]]
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

  // Animate the <Icon> color prop
  const animatedColor = useAnimatedProps(() => {
    const iconColor = interpolateColor(
      progress.value,
      [0, 1],
      [mapColorStates[color].icon.default, mapColorStates[color].icon.pressed]
    );
    return { color: iconColor };
  });

  return (
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
      accessibilityState={{ disabled }}
      // Usability
      // Add a touchable area around the button
      hitSlop={8}
      // Test
      testID={testID}
    >
      <Animated.View
        style={[
          IOIconButtonStyles.button,
          IOIconButtonStyles.buttonSizeSmall,
          !disabled && !reducedMotion && scaleAnimatedStyle
        ]}
      >
        {!disabled ? (
          <AnimatedIconWithColorTransition
            allowFontScaling
            name={icon}
            size={iconSize}
            animatedProps={animatedColor}
            color={mapColorStates[color]?.icon?.default}
          />
        ) : (
          <AnimatedIcon
            allowFontScaling
            name={icon}
            size={iconSize}
            color={mapColorStates[color]?.icon?.disabled}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};
