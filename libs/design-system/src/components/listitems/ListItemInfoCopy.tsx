import { ComponentProps, ReactNode, useCallback } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOListItemStyles, IOListItemVisualParams } from "../../core";
import { triggerHaptic } from "../../functions";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { BodySmall, H6 } from "../typography";

export type ListItemInfoCopy = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel"
> &
  WithTestID<{
    icon?: IOIcons;
    label: string;
    numberOfLines?: number;
    onPress: (event: GestureResponderEvent) => void;
    value: ReactNode | string;
  }>;

export const ListItemInfoCopy = ({
  label,
  value,
  numberOfLines = 2,
  onPress,
  icon,
  accessibilityLabel,
  accessibilityHint,
  testID
}: ListItemInfoCopy) => {
  const theme = useIOTheme();
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      triggerHaptic("impactLight");
      onPress(event);
    },
    [onPress]
  );

  const { dynamicFontScale, spacingScaleMultiplier, hugeFontEnabled } =
    useIOFontDynamicScale();

  const componentValueToAccessibility = typeof value === "string" ? value : "";

  const listItemAccessibilityLabel =
    accessibilityLabel || `${label}; ${componentValueToAccessibility}`;

  const foregroundColor = theme["interactiveElem-default"];

  const listItemInfoCopyContent = (
    <>
      <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
        {label}
      </BodySmall>
      {/* Let developer using a custom component (e.g: skeleton) */}
      {typeof value === "string" ? (
        <H6 color={foregroundColor} numberOfLines={numberOfLines}>
          {value}
        </H6>
      ) : (
        value
      )}
    </>
  );

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
          {icon && !hugeFontEnabled && (
            <Icon
              allowFontScaling
              color={theme["icon-decorative"]}
              name={icon}
              size={IOListItemVisualParams.iconSize}
            />
          )}
          <View style={{ flex: 1 }}>{listItemInfoCopyContent}</View>
          <Icon
            allowFontScaling
            color={foregroundColor}
            name="copy"
            size={IOListItemVisualParams.chevronSize}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
