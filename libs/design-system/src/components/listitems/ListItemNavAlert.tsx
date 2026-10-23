import { ComponentProps, ReactNode, useCallback } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IODimensions, IOListItemStyles } from "../../core";
import { triggerHaptic } from "../../functions";
import { useListItemAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import { Icon } from "../icons";
import { HSpacer } from "../layout";
import { BodySmall, H6 } from "../typography";

export type ListItemNavAlert = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel"
> &
  WithTestID<{
    description?: ReactNode | string;
    label: ReactNode | string;
    onPress: (event: GestureResponderEvent) => void;
    withoutIcon?: boolean;
  }>;

export const ListItemNavAlert = ({
  label,
  description,
  withoutIcon = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: ListItemNavAlert) => {
  const listItemColors = useIOColors().component.listItem;
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      triggerHaptic("impactLight");
      onPress(event);
    },
    [onPress]
  );

  const componentLabelToAccessibility = typeof label === "string" ? label : "";
  const componentDescriptionToAccessibility =
    typeof description === "string" ? description : "";

  const listItemAccessibilityLabel =
    accessibilityLabel ??
    `${componentLabelToAccessibility}; ${componentDescriptionToAccessibility}`;

  const listItemNavAlertContent = (
    <>
      {/* Let developer using a custom component (e.g: skeleton) */}
      {typeof label === "string" ? (
        <H6 color={listItemColors.foreground.label}>{label}</H6>
      ) : (
        label
      )}
      {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- ReactNode: "" and false mean nothing to render */}
      {description && (
        <>
          {typeof description === "string" ? (
            <BodySmall
              color={listItemColors.foreground.error}
              weight="Semibold"
            >
              {description}
            </BodySmall>
          ) : (
            description
          )}
        </>
      )}
    </>
  );

  const iconColor = listItemColors.foreground.action.primary;

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
          style={[IOListItemStyles.listItemInner, scaleAnimatedStyle]}
        >
          {!withoutIcon && (
            <>
              <Icon
                allowFontScaling
                color={listItemColors.foreground.error}
                name="errorFilled"
                size={IODimensions.size.icon.listItem}
              />
              <HSpacer
                allowScaleSpacing
                size={IODimensions.gap.listItem.default.leading}
              />
            </>
          )}
          <View style={{ flex: 1 }}>{listItemNavAlertContent}</View>
          {/* No gap: the chevron glyph is drawn against the right edge of its box */}
          <Icon
            allowFontScaling
            color={iconColor}
            name="chevronRightListItem"
            size={IODimensions.size.icon.chevron}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
