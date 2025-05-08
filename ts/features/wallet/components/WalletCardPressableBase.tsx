import {
  PressableBaseProps,
  useScaleAnimation,
  WithTestID
} from "@pagopa/io-app-design-system";
import { PropsWithChildren } from "react";

import { Pressable, PressableProps } from "react-native-gesture-handler";
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
      onPress={onPress as PressableProps["onPress"]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPressIn={onPressIn as any as PressableProps["onPressIn"]}
      onPressOut={onPressOut as any as PressableProps["onPressOut"]}
      onTouchEnd={onPressOut}
    >
      <Animated.View style={scaleAnimatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};
