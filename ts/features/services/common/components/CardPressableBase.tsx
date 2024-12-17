import {
  PressableBaseProps,
  useScaleAnimation,
  WithTestID
} from "@pagopa/io-app-design-system";
import React from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";

type CardPressableBaseProps = WithTestID<PressableBaseProps>;

export const CardPressableBase = ({
  onPress,
  testID,
  accessibilityLabel,
  children
}: React.PropsWithChildren<CardPressableBaseProps>) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  if (onPress === undefined) {
    return <>{children}</>;
  }

  return (
    <Pressable
      onPress={onPress}
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
