import {
  PressableBaseProps,
  useScaleAnimation,
  WithTestID
} from "@io-app/design-system";
import { PropsWithChildren } from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";

export type WalletCardPressableBaseProps = WithTestID<PressableBaseProps>;

export const WalletCardPressableBase = ({
  onPress,
  testID,
  accessibilityLabel,
  children
}: PropsWithChildren<WalletCardPressableBaseProps>) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  if (onPress === undefined) {
    return <>{children}</>;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessible={true}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={testID}
    >
      <Animated.View style={scaleAnimatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};
