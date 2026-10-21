import { GestureResponderEvent, Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useReducedMotion
} from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IOColors, IOIconButtonStyles, IOOpacity } from "../../core";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import {
  AnimatedIcon,
  AnimatedIconWithColorTransition,
  IOIcons,
  IOIconSizeScale
} from "../icons";

export type IconButton = WithTestID<{
  accessibilityHint?: string;
  accessibilityLabel: string;
  color?: "contrast" | "neutral" | "primary";
  disabled?: boolean;
  icon: IOIcons;
  iconSize?: IOIconSizeScale;
  onPress: (event: GestureResponderEvent) => void;
  persistentColorMode?: boolean;
}>;

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
  const colors = useIOColors();
  const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("exaggerated");
  const reducedMotion = useReducedMotion();

  /* Legacy behavior: only `neutral` keeps the light colors */
  const iconColors = (
    persistentColorMode && color === "neutral" ? IOColors.light : colors
  ).component.iconButton[color].foreground;

  // Animate the <Icon> color prop
  const animatedColor = useAnimatedProps(() => {
    const iconColor = interpolateColor(
      progress.value,
      [0, 1],
      [iconColors.default, iconColors.pressed]
    );
    return { color: iconColor };
  });

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={"button"}
      accessibilityState={{ disabled }}
      // Accessibility
      accessible={true}
      disabled={disabled}
      // Usability
      // Add a touchable area around the button
      hitSlop={8}
      // Events
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      // Test
      testID={testID}
    >
      <Animated.View
        style={[
          IOIconButtonStyles.button,
          IOIconButtonStyles.buttonSizeSmall,
          // TODO: split into `disabled && { opacity }` when snapshots can be updated (folded to avoid churn)
          disabled
            ? { opacity: IOOpacity.disabled }
            : !reducedMotion && scaleAnimatedStyle
        ]}
      >
        {!disabled ? (
          <AnimatedIconWithColorTransition
            allowFontScaling
            animatedProps={animatedColor}
            color={iconColors.default}
            name={icon}
            size={iconSize}
          />
        ) : (
          <AnimatedIcon
            allowFontScaling
            color={iconColors.disabled}
            name={icon}
            size={iconSize}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};
