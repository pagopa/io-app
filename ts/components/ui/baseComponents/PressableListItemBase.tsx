import * as React from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { WithTestID } from "../../../types/WithTestID";
import { IOListItemStyles } from "../../core/variables/IOStyles";
import { useBaseSpringAnimation } from "../hooks/useBaseSpringAnimation";

export type PressableBaseProps = WithTestID<{
  accessibilityLabel?: string;
  onPress?: () => void;
}>;
export const PressableListItemBase = ({
  onPress,
  testID,
  accessibilityLabel,
  children
}: React.PropsWithChildren<PressableBaseProps>) => {
  const { onPressIn, onPressOut, animatedScaleStyle, animatedBackgroundStyle } =
    useBaseSpringAnimation();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityRole="button"
    >
      <Animated.View
        style={[IOListItemStyles.listItem, animatedBackgroundStyle]}
      >
        <Animated.View
          style={[IOListItemStyles.listItemInner, animatedScaleStyle]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
