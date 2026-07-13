import { ComponentProps, ReactNode } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { IOListItemStyles, IOListItemVisualParams } from "../../core";
import { useIOTheme } from "../../context";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon } from "../icons";
import { BodySmall, H6 } from "../typography";

export type ListItemNavAlert = WithTestID<{
  value: string | ReactNode;
  description?: string | ReactNode;
  withoutIcon?: boolean;
  onPress: (event: GestureResponderEvent) => void;
}> &
  Pick<
    ComponentProps<typeof Pressable>,
    "accessibilityLabel" | "accessibilityHint"
  >;

export const ListItemNavAlert = ({
  value,
  description,
  withoutIcon = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID
}: ListItemNavAlert) => {
  const theme = useIOTheme();
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const componentValueToAccessibility = typeof value === "string" ? value : "";
  const componentDescriptionToAccessibility =
    typeof description === "string" ? description : "";

  const listItemAccessibilityLabel =
    accessibilityLabel ??
    `${componentValueToAccessibility}; ${componentDescriptionToAccessibility}`;

  // TODO: Remove this when legacy look is deprecated https://pagopa.atlassian.net/browse/IOPLT-153
  const listItemNavAlertContent = (
    <>
      {/* Let developer using a custom component (e.g: skeleton) */}
      {typeof value === "string" ? (
        <H6 color={theme["textBody-default"]}>{value}</H6>
      ) : (
        value
      )}
      {description && (
        <>
          {typeof description === "string" ? (
            <BodySmall weight="Semibold" color={theme.errorText}>
              {description}
            </BodySmall>
          ) : (
            description
          )}
        </>
      )}
    </>
  );

  const iconColor = theme["interactiveElem-default"];

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
        style={[IOListItemStyles.listItem, backgroundAnimatedStyle]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
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
          {!withoutIcon && (
            <Icon
              allowFontScaling
              name="errorFilled"
              color={theme.errorIcon}
              size={IOListItemVisualParams.iconSize}
            />
          )}
          <View style={{ flex: 1 }}>{listItemNavAlertContent}</View>
          <Icon
            allowFontScaling
            name="chevronRightListItem"
            color={iconColor}
            size={IOListItemVisualParams.chevronSize}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
