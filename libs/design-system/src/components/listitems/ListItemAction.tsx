import { ComponentProps } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { useIOTheme } from "../../context";
import { IOColors, IOListItemStyles, IOListItemVisualParams } from "../../core";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { AnimatedIcon, IOIcons } from "../icons";
import { ButtonText } from "../typography/ButtonText";

export type ListItemAction = WithTestID<{
  label: string;
  variant: "primary" | "danger";
  onPress: (event: GestureResponderEvent) => void;
  icon?: IOIcons;
}> &
  Pick<
    ComponentProps<typeof Pressable>,
    "accessibilityLabel" | "accessibilityHint"
  >;

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
          {icon && (
            <AnimatedIcon
              allowFontScaling
              name={icon}
              color={IOColors[mapForegroundColor[variant]]}
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
