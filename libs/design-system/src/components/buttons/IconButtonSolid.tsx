import { GestureResponderEvent, Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion
} from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IOIconButtonStyles, IOOpacity } from "../../core";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import { AnimatedIcon, IOIcons } from "../icons";

export type IconButtonSolid = WithTestID<{
  accessibilityHint?: string;
  accessibilityLabel: string;
  color?: "contrast" | "primary";
  disabled?: boolean;
  icon: IOIcons;
  onPress: (event: GestureResponderEvent) => void;
}>;

export const IconButtonSolid = ({
  icon,
  color = "primary",
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: IconButtonSolid) => {
  const { progress, onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("exaggerated");
  const reducedMotion = useReducedMotion();

  const buttonColors = useIOColors().component.iconButtonSolid[color];

  const backgroundColorAnimationStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [buttonColors.background.default, buttonColors.background.pressed]
    )
  }));

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={"button"}
      accessibilityState={{ disabled }}
      accessible={true}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ alignSelf: "flex-start" }}
      testID={testID}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          IOIconButtonStyles.button,
          IOIconButtonStyles.buttonSizeLarge,
          !disabled && !reducedMotion && scaleAnimatedStyle,
          !disabled && backgroundColorAnimationStyle,
          disabled
            ? {
                backgroundColor: buttonColors.background.disabled,
                opacity: IOOpacity.disabled
              }
            : { backgroundColor: buttonColors.background.default }
        ]}
      >
        <AnimatedIcon
          allowFontScaling
          color={
            !disabled
              ? buttonColors.foreground.default
              : buttonColors.foreground.disabled
          }
          name={icon}
        />
      </Animated.View>
    </Pressable>
  );
};
