import React from "react";
import { GestureResponderEvent, Pressable, StyleSheet } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import {
  IOColors,
  IOIcons,
  Icon,
  hexToRgba,
  HSpacer,
  IOScaleValues,
  IOSpringValues
} from "@pagopa/io-app-design-system";
import { WithTestID } from "../../types/WithTestID";
import { LabelHeader } from "../core/typography/LabelHeader";
import { useSpringPressProgressValue } from "./utils/hooks/useSpringPressProgressValue";

type ColorMode = "light" | "dark";

export type TabItem = WithTestID<{
  label: string;
  color?: ColorMode;
  selected?: boolean;
  fullWidth?: boolean;
  // Icons
  icon?: IOIcons;
  iconSelected?: IOIcons;
  // Accessibility
  accessibilityLabel: string;
  accessibilityHint?: string;
  // Events
  onPress?: (event: GestureResponderEvent) => void;
}>;

type ColorStates = {
  background: {
    default: string;
    selected: string;
    pressed: string;
  };
  foreground: {
    default: IOColors;
    selected: IOColors;
  };
};

const mapColorStates: Record<NonNullable<TabItem["color"]>, ColorStates> = {
  light: {
    background: {
      default: "#ffffff00",
      selected: IOColors["grey-50"],
      pressed: IOColors["grey-50"]
    },
    foreground: {
      default: "grey-650",
      selected: "black"
    }
  },
  dark: {
    background: {
      default: "#ffffff00",
      selected: IOColors.white,
      pressed: IOColors.white
    },
    foreground: {
      default: "white",
      selected: "grey-850"
    }
  }
};

const TabItem = ({
  label,
  color = "light",
  selected = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  onPress,
  icon,
  iconSelected
}: TabItem) => {
  const {
    progress: progressPressed,
    onPressIn,
    onPressOut
  } = useSpringPressProgressValue(IOSpringValues.selection);

  const colors = mapColorStates[color];
  const foregroundColor = colors.foreground[selected ? "selected" : "default"];

  const opaquePressedBackgroundColor = hexToRgba(
    colors.background.pressed,
    0.1
  );

  const isSelected: Animated.SharedValue<number> = useSharedValue(0);
  const progressSelected = useDerivedValue(() =>
    withSpring(isSelected.value, IOSpringValues.selection)
  );

  React.useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isSelected.value = selected ? 1 : 0;
  }, [isSelected, selected]);

  // Interpolate animation values from `pressed` values
  const animatedStyle = useAnimatedStyle(() => {
    // Link color states to the pressed states
    const pressedBackgroundColor = interpolateColor(
      progressPressed.value,
      [0, 1],
      [colors.background.default, opaquePressedBackgroundColor]
    );

    const selectedBackgroundColor = interpolateColor(
      progressSelected.value,
      [0, 1],
      [opaquePressedBackgroundColor, colors.background.selected]
    );

    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, IOScaleValues?.basicButton?.pressedState],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor: selected
        ? selectedBackgroundColor
        : pressedBackgroundColor,
      transform: [{ scale }]
    };
  }, [progressPressed, progressSelected, selected]);

  const activeIcon = selected ? iconSelected ?? icon : icon;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={"button"}
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
    >
      <Animated.View
        style={[styles.container, animatedStyle, fullWidth && styles.fullWidth]}
      >
        {activeIcon && (
          <>
            <Icon name={activeIcon} color={foregroundColor} size={16} />
            <HSpacer size={4} />
          </>
        )}
        <LabelHeader color={foregroundColor}>{label}</LabelHeader>
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
    borderRadius: 65,
    justifyContent: "center",
    alignSelf: "flex-start"
  },
  fullWidth: {
    alignSelf: "auto"
  }
});

export { TabItem };
