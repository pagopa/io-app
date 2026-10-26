import { ComponentProps, useCallback } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IODimensions, IOListItemStyles } from "../../core";
import { triggerHaptic } from "../../functions";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { AnimatedIcon, IOIcons } from "../icons";
import { ButtonText } from "../typography/ButtonText";

export type ListItemAction = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel" | "accessibilityRole"
> &
  WithTestID<{
    icon?: IOIcons;
    label: string;
    onPress: (event: GestureResponderEvent) => void;
    variant: "danger" | "primary";
  }>;

export const ListItemAction = ({
  variant,
  label,
  onPress,
  icon,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "button",
  testID
}: ListItemAction) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      triggerHaptic("impactLight");
      onPress(event);
    },
    [onPress]
  );

  const listItemColors = useIOColors().component.listItem;

  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const listItemAccessibilityLabel = accessibilityLabel || `${label}`;

  const foregroundColor = listItemColors.foreground.action[variant];

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={listItemAccessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessible={true}
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={testID}
    >
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[IOListItemStyles.listItem, backgroundAnimatedStyle]}
      >
        <Animated.View
          style={[
            IOListItemStyles.listItemInner,
            {
              columnGap:
                IODimensions.gap.listItem.default.leading *
                dynamicFontScale *
                spacingScaleMultiplier
            },
            scaleAnimatedStyle
          ]}
        >
          {icon && (
            <AnimatedIcon
              allowFontScaling
              color={foregroundColor}
              name={icon}
              size={IODimensions.size.icon.listItem}
            />
          )}
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <ButtonText color={foregroundColor}>{label}</ButtonText>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
