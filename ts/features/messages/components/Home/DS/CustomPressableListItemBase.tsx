import {
  IOColors,
  IOListItemStyles,
  useListItemAnimation,
  WithTestID
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";

export type PressableBaseProps = WithTestID<
  Pick<
    React.ComponentProps<typeof Pressable>,
    | "onPress"
    | "onLongPress"
    | "accessibilityLabel"
    | "accessibilityHint"
    | "accessibilityState"
    | "accessibilityRole"
  > & { minHeight?: number; selected?: boolean }
>;

export const CustomPressableListItemBase = ({
  onPress,
  onLongPress,
  testID,
  children,
  accessibilityRole,
  minHeight,
  selected,
  ...props
}: React.PropsWithChildren<PressableBaseProps>) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

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
      style={[
        {
          backgroundColor: selected ? IOColors["blueIO-50"] : undefined
        },
        minHeight ? { minHeight } : {}
      ]}
      {...props}
    >
      <Animated.View
        style={[
          IOListItemStyles.listItem,
          !selected ? backgroundAnimatedStyle : undefined,
          { flexGrow: 1, justifyContent: "center" }
        ]}
      >
        <Animated.View
          style={[IOListItemStyles.listItemInner, scaleAnimatedStyle]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
