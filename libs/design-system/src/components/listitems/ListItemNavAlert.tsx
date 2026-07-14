import { ComponentProps, ReactNode } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOListItemStyles, IOListItemVisualParams } from "../../core";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Icon } from "../icons";
import { BodySmall, H6 } from "../typography";

export type ListItemNavAlert = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityHint" | "accessibilityLabel"
> &
  WithTestID<{
    description?: ReactNode | string;
    onPress: (event: GestureResponderEvent) => void;
    value: ReactNode | string;
    withoutIcon?: boolean;
  }>;

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
            <BodySmall color={theme.errorText} weight="Semibold">
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
      accessibilityHint={accessibilityHint}
      accessibilityLabel={listItemAccessibilityLabel}
      accessibilityRole="button"
      accessible={true}
      onPress={onPress}
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
          {!withoutIcon && (
            <Icon
              allowFontScaling
              color={theme.errorIcon}
              name="errorFilled"
              size={IOListItemVisualParams.iconSize}
            />
          )}
          <View style={{ flex: 1 }}>{listItemNavAlertContent}</View>
          <Icon
            allowFontScaling
            color={iconColor}
            name="chevronRightListItem"
            size={IOListItemVisualParams.chevronSize}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
