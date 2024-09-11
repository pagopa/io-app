import { WithTestID } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useListItemSpringAnimation } from "../../../messages/components/Home/DS/useListItemSpringAnimation";

// this component is almost a full copy of the DS'
// PressableListItemBase, with the key difference
// that this component accepts external styling and is not
// necessarily a ListItem's base component; things that
// are necessary for the FIMS history flow.

export type FimsHistoryPressableBaseProps = WithTestID<
  {
    pressableProps?: Pick<
      React.ComponentProps<typeof Pressable>,
      | "onPress"
      | "accessibilityLabel"
      | "accessibilityHint"
      | "accessibilityState"
      | "accessibilityRole"
    >;
  } & {
    style?: React.ComponentProps<typeof Animated.View>["style"];
    contentContainerStyle?: StyleProp<ViewStyle>;
  }
>;

export const FimsHistoryPressableBase = ({
  testID,
  children,
  ...props
}: React.PropsWithChildren<FimsHistoryPressableBaseProps>) => {
  const { onPressIn, onPressOut, animatedScaleStyle, animatedBackgroundStyle } =
    useListItemSpringAnimation();
  const { pressableProps } = props;

  return (
    <Pressable
      testID={testID}
      accessible={true}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessibilityRole={pressableProps?.accessibilityRole || "button"}
      {...pressableProps}
    >
      <Animated.View style={[animatedBackgroundStyle, props.style]}>
        <Animated.View style={animatedScaleStyle}>
          <View style={props.contentContainerStyle}>{children}</View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
