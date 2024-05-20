import * as React from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import {
  IOColors,
  IOListItemStyles,
  WithTestID
} from "@pagopa/io-app-design-system";
import { useListItemSpringAnimation } from "./useListItemSpringAnimation";

export type PressableBaseProps = WithTestID<
  Pick<
    React.ComponentProps<typeof Pressable>,
    | "onPress"
    | "onLongPress"
    | "accessibilityLabel"
    | "accessibilityHint"
    | "accessibilityState"
    | "accessibilityRole"
  > & { selected?: boolean }
>;

export const CustomPressableListItemBase = ({
  onPress,
  onLongPress,
  testID,
  children,
  accessibilityRole,
  selected,
  ...props
}: React.PropsWithChildren<PressableBaseProps>) => {
  const { onPressIn, onPressOut, animatedScaleStyle, animatedBackgroundStyle } =
    useListItemSpringAnimation();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessible={true}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityRole={accessibilityRole || "button"}
      style={{ backgroundColor: selected ? IOColors["blueIO-50"] : undefined }}
      {...props}
    >
      <Animated.View
        style={[
          IOListItemStyles.listItem,
          !selected ? animatedBackgroundStyle : undefined
        ]}
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
