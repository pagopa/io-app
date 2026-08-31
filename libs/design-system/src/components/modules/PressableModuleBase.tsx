import { ComponentProps, PropsWithChildren, useCallback } from "react";
import { GestureResponderEvent, Pressable } from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOColors, IOModuleIDPSavedVSpacing, IOModuleStyles } from "../../core";
import { triggerHaptic } from "../../functions";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";

export type PressableModuleBaseProps = WithTestID<
  Pick<
    ComponentProps<typeof Pressable>,
    "accessibilityHint" | "accessibilityLabel" | "onPress"
  > & {
    withLooseSpacing?: boolean;
  }
>;

export const PressableModuleBase = ({
  onPress,
  withLooseSpacing = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  children
}: PropsWithChildren<PressableModuleBaseProps>) => {
  const theme = useIOTheme();
  const reducedMotion = useReducedMotion();
  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation(
    reducedMotion ? "slight" : "medium"
  );
  /* We use a slight scaleEffect if `reducedMotion` is enabled.
  We don't disable it completely because that's the only
  difference between the two states "default" and "pressed".
  If we remove it, they they won't be able to understand
  if there's an ongoing interaction. */

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (onPress) {
        triggerHaptic("impactLight");
        onPress(event);
      }
    },
    [onPress]
  );

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessible={true}
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={testID}
    >
      <Animated.View
        style={[
          IOModuleStyles.button,
          { borderColor: IOColors[theme["cardBorder-default"]] },
          withLooseSpacing && { paddingVertical: IOModuleIDPSavedVSpacing },
          scaleAnimatedStyle
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
