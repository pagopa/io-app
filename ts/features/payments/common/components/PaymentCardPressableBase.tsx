import { PressableBaseProps, WithTestID } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { useSpringPressScaleAnimation } from "../../../../components/ui/utils/hooks/useSpringPressScaleAnimation";

type PaymentCardPressableBaseProps = WithTestID<PressableBaseProps>;

const PaymentCardPressableBase = ({
  onPress,
  testID,
  accessibilityLabel,
  children
}: React.PropsWithChildren<PaymentCardPressableBaseProps>) => {
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
    >
      <Animated.View style={animatedScaleStyle}>{children}</Animated.View>
    </Pressable>
  );
};

export { PaymentCardPressableBase };
