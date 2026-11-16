import { Ref, useCallback } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withSpring
} from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IODimensions, IOOpacity, IOSpringValues } from "../../core";
import { triggerHaptic } from "../../functions";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { IOText } from "../typography";

export type TabItem = WithTestID<{
  accessibilityHint?: string;
  // Accessibility
  accessibilityLabel: string;
  color?: TabItemColor;
  disabled?: boolean;
  // Icons
  icon?: IOIcons;
  iconSelected?: IOIcons;
  label: string;
  // Events
  onPress?: (event: GestureResponderEvent) => void;
  ref?: Ref<View>;
  selected?: boolean;
}>;

/* `contrast` on a dark or accent background */
type TabItemColor = "contrast" | "primary";

type TabItemState = "default" | "disabled" | "selected";

const TabItem = ({
  label,
  color = "primary",
  selected = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  onPress,
  disabled = false,
  icon,
  iconSelected,
  ref
}: TabItem) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("medium");
  const reducedMotion = useReducedMotion();

  const tabColors = useIOColors().component.tabItem[color];
  const border = "border" in tabColors ? tabColors.border : undefined;

  const itemState: TabItemState = selected
    ? "selected"
    : disabled
      ? "disabled"
      : "default";

  const foregroundColor = tabColors.foreground[itemState];

  const selectedStateTransition = useDerivedValue(() =>
    withSpring(selected ? 1 : 0, IOSpringValues.selection)
  );

  // Interpolate animation values from `pressed` values
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectedStateTransition.value,
      [0, 1],
      [tabColors.background.default, tabColors.background.selected]
    ),
    ...(border != null && {
      borderColor: interpolateColor(
        selectedStateTransition.value,
        [0, 1],
        [border.default, border.selected]
      )
    })
  }));

  const activeIcon = selected ? (iconSelected ?? icon) : icon;

  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (onPress) {
        triggerHaptic("impactLight");
        onPress(event);
      }
    },
    [onPress]
  );

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!selected }}
      accessible={true}
      disabled={disabled}
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      ref={ref}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.container,
          { columnGap: IODimensions.gap.tab.icon },
          border != null && { borderWidth: IODimensions.stroke.default },
          !disabled && !reducedMotion && scaleAnimatedStyle,
          animatedStyle,
          disabled && { opacity: IOOpacity.disabled }
        ]}
      >
        {activeIcon && (
          <Icon
            color={foregroundColor}
            name={activeIcon}
            size={IODimensions.size.icon.tab}
          />
        )}
        <IOText color={foregroundColor} size={14} weight="Semibold">
          {label}
        </IOText>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: IODimensions.padding.tab.horizontal,
    paddingVertical: IODimensions.padding.tab.vertical,
    borderRadius: IODimensions.radius.tab,
    borderCurve: "continuous",
    justifyContent: "center",
    alignSelf: "flex-start"
  }
});

export { TabItem };
