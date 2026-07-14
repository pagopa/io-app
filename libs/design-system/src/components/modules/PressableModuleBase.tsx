import { ComponentProps, PropsWithChildren, useCallback } from "react";
import { GestureResponderEvent, Pressable } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { IOColors, IOModuleIDPSavedVSpacing, IOModuleStyles } from "../../core";
import { useIOTheme } from "../../context";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";

export type PressableModuleBaseProps = WithTestID<
  {
    withLooseSpacing?: boolean;
  } & Pick<
    ComponentProps<typeof Pressable>,
    "onPress" | "accessibilityLabel" | "accessibilityHint"
  >
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
        ReactNativeHapticFeedback.trigger("impactLight");
        onPress(event);
      }
    },
    [onPress]
  );

  return (
    <Pressable
      onPress={handleOnPress}
      testID={testID}
      accessible={true}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
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
