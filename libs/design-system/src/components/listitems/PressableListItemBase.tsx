import { ComponentProps, PropsWithChildren } from "react";
import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { IOListItemStyles, IOListItemVisualParams } from "../../core";
import { WithTestID } from "../../utils/types";
import { useListItemAnimation } from "../../hooks";

export type PressableBaseProps = WithTestID<
  Pick<
    ComponentProps<typeof Pressable>,
    | "onPress"
    | "accessibilityLabel"
    | "accessibilityHint"
    | "accessibilityState"
    | "accessibilityRole"
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
      onPress={onPress}
      testID={testID}
      accessible={true}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityRole={accessibilityRole || "button"}
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
