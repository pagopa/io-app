import React from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { PressableBaseProps, WithTestID } from "@pagopa/io-app-design-system";
import { useSpringPressScaleAnimation } from "../../../../components/ui/utils/hooks/useSpringPressScaleAnimation";

type CardPressableBaseProps = WithTestID<PressableBaseProps>;

export const CardPressableBase = ({
  onPress,
  testID,
  accessibilityLabel,
  children
}: React.PropsWithChildren<CardPressableBaseProps>) => {
  const { onPressIn, onPressOut, animatedScaleStyle } =
    useSpringPressScaleAnimation();

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
      <Animated.View style={[animatedScaleStyle, { flexGrow: 1 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
