import { ComponentProps, useCallback } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOColors, IOListItemStyles, IOListItemVisualParams } from "../../core";
import { triggerHaptic } from "../../functions";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { AnimatedIcon, IOIcons } from "../icons";
import { ButtonText } from "../typography/ButtonText";

export type ListItemAction = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel"
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

  const theme = useIOTheme();

  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const listItemAccessibilityLabel = accessibilityLabel || `${label}`;

  const mapForegroundColor: Record<
    NonNullable<ListItemAction["variant"]>,
    IOColors
  > = {
    primary: theme["interactiveElem-default"],
    danger: theme.errorText
  };

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={listItemAccessibilityLabel}
      accessibilityRole="button"
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
                IOListItemVisualParams.iconMargin *
                dynamicFontScale *
                spacingScaleMultiplier
            },
            scaleAnimatedStyle
          ]}
        >
          {icon && (
            <AnimatedIcon
              allowFontScaling
              color={IOColors[mapForegroundColor[variant]]}
              name={icon}
              size={IOListItemVisualParams.iconSize}
            />
          )}
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <ButtonText color={mapForegroundColor[variant]}>{label}</ButtonText>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
