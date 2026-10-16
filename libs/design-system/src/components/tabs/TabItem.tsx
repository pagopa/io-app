import { Ref, useCallback, useMemo } from "react";
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

import { useIOTheme } from "../../context";
import { hexToRgba, IOColors, IOSpringValues } from "../../core";
import { triggerHaptic } from "../../functions";
import { useScaleAnimation } from "../../hooks";
import { WithTestID } from "../../utils/types";
import { Icon, IOIcons } from "../icons";
import { IOText } from "../typography";

export type TabItem = WithTestID<{
  accessibilityHint?: string;
  // Accessibility
  accessibilityLabel: string;
  color?: ColorMode;
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

type ColorMode = "dark" | "light";

type ColorStates = {
  background: {
    default: string;
    selected: string;
  };
  border: {
    default: string;
    selected: string;
  };
  foreground: {
    default: IOColors;
    disabled: IOColors;
    selected: IOColors;
  };
};

type TabItemState = "default" | "disabled" | "selected";

const DISABLED_OPACITY = 0.5;

const TabItem = ({
  label,
  color = "light",
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
  const theme = useIOTheme();
  const reducedMotion = useReducedMotion();

  const mapColorStates: Record<
    NonNullable<TabItem["color"]>,
    ColorStates
  > = useMemo(
    () => ({
      light: {
        border: {
          default: IOColors[theme["tab-item-border-default"]],
          selected: hexToRgba(
            IOColors[theme["tab-item-foreground-selected"]],
            0.5
          )
        },
        background: {
          default: hexToRgba(
            IOColors[theme["tab-item-background-selected"]],
            0
          ),
          selected: hexToRgba(
            IOColors[theme["tab-item-background-selected"]],
            0.25
          ),
          pressed: IOColors[theme["appBackground-primary"]]
        },
        foreground: {
          default: theme["tab-item-foreground-default"],
          selected: theme["tab-item-foreground-selected"],
          disabled: "grey-700"
        }
      },
      dark: {
        border: {
          default: hexToRgba(IOColors.white, 0),
          selected: IOColors.white
        },
        background: {
          default: hexToRgba(IOColors.white, 0.1),
          selected: IOColors.white,
          pressed: IOColors.white
        },
        foreground: {
          default: "white",
          selected: "black",
          disabled: "white"
        }
      }
    }),
    [theme]
  );

  const itemState: TabItemState = selected
    ? "selected"
    : disabled
      ? "disabled"
      : "default";

  const foregroundColor = mapColorStates[color].foreground[itemState];

  const selectedStateTransition = useDerivedValue(() =>
    withSpring(selected ? 1 : 0, IOSpringValues.selection)
  );

  // Interpolate animation values from `pressed` values
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectedStateTransition.value,
      [0, 1],
      [
        mapColorStates[color].background.default,
        mapColorStates[color].background.selected
      ]
    ),
    borderColor: interpolateColor(
      selectedStateTransition.value,
      [0, 1],
      [
        mapColorStates[color].border.default,
        mapColorStates[color].border.selected
      ]
    )
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
      accessibilityState={{ checked: !!selected }}
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
          { columnGap: 4 },
          !disabled && !reducedMotion && scaleAnimatedStyle,
          animatedStyle,
          disabled && { opacity: DISABLED_OPACITY }
        ]}
      >
        {activeIcon && (
          <Icon color={foregroundColor} name={activeIcon} size={16} />
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 64,
    borderCurve: "continuous",
    justifyContent: "center",
    alignSelf: "flex-start"
  }
});

export { TabItem };
