import { ComponentProps, ReactNode } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { IOListItemStyles, IOListItemVisualParams } from "../../core";
import { useIOTheme } from "../../context";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { IOIcons, Icon } from "../icons";
import { BodySmall, H6 } from "../typography";

export type ListItemInfoCopy = WithTestID<{
  label: string;
  value: string | ReactNode;
  numberOfLines?: number;
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
}> &
  Pick<
    ComponentProps<typeof Pressable>,
    "accessibilityLabel" | "accessibilityHint"
  >;

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

  const { dynamicFontScale, spacingScaleMultiplier, hugeFontEnabled } =
    useIOFontDynamicScale();

  const componentValueToAccessibility = typeof value === "string" ? value : "";

  const listItemAccessibilityLabel =
    accessibilityLabel || `${label}; ${componentValueToAccessibility}`;

  const foregroundColor = theme["interactiveElem-default"];

  const listItemInfoCopyContent = (
    <>
      <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
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
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      accessible={true}
      accessibilityLabel={listItemAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      testID={testID}
    >
      <Animated.View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
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
              name={icon}
              color={theme["icon-decorative"]}
              size={IOListItemVisualParams.iconSize}
            />
          )}
          <View style={{ flex: 1 }}>{listItemInfoCopyContent}</View>
          <Icon
            allowFontScaling
            name="copy"
            color={foregroundColor}
            size={IOListItemVisualParams.chevronSize}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
