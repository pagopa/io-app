import { useScaleAnimation, WithTestID } from "@io-app/design-system";
import { PropsWithChildren } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated from "react-native-reanimated";

export type WalletCardPressableBaseProps = WithTestID<
  Pick<PressableProps, "accessibilityLabel" | "onPress">
>;

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
