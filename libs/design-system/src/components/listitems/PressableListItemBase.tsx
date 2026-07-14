import { ComponentProps, PropsWithChildren } from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";

import { IOListItemStyles, IOListItemVisualParams } from "../../core";
import { useListItemAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";

export type PressableBaseProps = WithTestID<
  Pick<
    ComponentProps<typeof Pressable>,
    | "accessibilityHint"
    | "accessibilityLabel"
    | "accessibilityRole"
    | "accessibilityState"
    | "onPress"
  >
>;

export const PressableListItemBase = ({
  onPress,
  testID,
  children,
  accessibilityRole,
  ...props
}: PropsWithChildren<PressableBaseProps>) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  return (
    <Pressable
      accessibilityRole={accessibilityRole || "button"}
      accessible={true}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={testID}
      {...props}
    >
      <Animated.View
        style={[IOListItemStyles.listItem, backgroundAnimatedStyle]}
      >
        <Animated.View
          style={[
            IOListItemStyles.listItemInner,
            { columnGap: IOListItemVisualParams.iconMargin },
            scaleAnimatedStyle
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
