import {
  PressableBaseProps,
  useScaleAnimation,
  WithTestID
} from "@pagopa/io-app-design-system";
import { PropsWithChildren, useCallback } from "react";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

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
        ReactNativeHapticFeedback.trigger("impactLight");
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
      onPress={handleOnPress}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      style={{ flexGrow: 1 }}
    >
      <Animated.View style={[scaleAnimatedStyle, { flexGrow: 1 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
