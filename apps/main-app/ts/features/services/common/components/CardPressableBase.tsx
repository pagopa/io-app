import {
  HapticType,
  triggerHaptic,
  useScaleAnimation,
  WithTestID
} from "@io-app/design-system";
import { PropsWithChildren, useCallback } from "react";
import { GestureResponderEvent, Pressable, PressableProps } from "react-native";
import Animated from "react-native-reanimated";

type CardPressableBaseProps = WithTestID<
  Pick<PressableProps, "accessibilityLabel" | "onPress"> & {
    /* Haptic feedback played on press, meant to be tuned to the card size */
    hapticType?: HapticType;
  }
>;

export const CardPressableBase = ({
  onPress,
  testID,
  accessibilityLabel,
  hapticType = "impactLight",
  children
}: PropsWithChildren<CardPressableBaseProps>) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (onPress) {
        triggerHaptic(hapticType);
        onPress(event);
      }
    },
    [hapticType, onPress]
  );

  if (onPress === undefined) {
    return <>{children}</>;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessible={true}
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      style={{ flexGrow: 1 }}
      testID={testID}
    >
      <Animated.View style={[scaleAnimatedStyle, { flexGrow: 1 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
