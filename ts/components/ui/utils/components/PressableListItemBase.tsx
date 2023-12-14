import * as React from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { IOListItemStyles } from "@pagopa/io-app-design-system";
import { WithTestID } from "../../../../types/WithTestID";
import { useListItemBaseSpringAnimation } from "../hooks/useListItemBaseSpringAnimation";

export type PressableBaseProps = WithTestID<{
  accessibilityLabel?: string;
  onPress?: () => void;
}>;

/**
 * A base component for creating pressable list items with animation support.
 *
 * @param {string} accessibilityLabel - An optional label for accessibility.
 * @param {function} onPress - The function to be executed when the item is pressed.
 * @param {string} testID - An optional test identifier for testing purposes.
 * @param {React.ReactNode} children - The content to be rendered within the list item.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the PressableListItemBase of the @pagopa/io-app-design-system library.
 *
 */
export const PressableListItemBase = ({
  onPress,
  testID,
  accessibilityLabel,
  children
}: React.PropsWithChildren<PressableBaseProps>) => {
  const { onPressIn, onPressOut, animatedScaleStyle, animatedBackgroundStyle } =
    useListItemBaseSpringAnimation();
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
