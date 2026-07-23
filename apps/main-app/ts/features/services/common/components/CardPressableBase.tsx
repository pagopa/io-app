import {
  PressableBaseProps,
  triggerHaptic,
  useScaleAnimation,
  WithTestID
} from "@io-app/design-system";
import { PropsWithChildren, useCallback } from "react";
import { GestureResponderEvent, Pressable } from "react-native";
import Animated from "react-native-reanimated";

type CardPressableBaseProps = WithTestID<PressableBaseProps>;

export const CardPressableBase = ({
  onPress,
  testID,
  accessibilityLabel,
  children
}: PropsWithChildren<CardPressableBaseProps>) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (onPress) {
        triggerHaptic("impactLight");
        onPress(event);
      }
    },
    [onPress]
  );

  if (onPress === undefined) {
    return <>{children}</>;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
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
