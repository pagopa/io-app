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
import { WithTestID } from "../../types/WithTestID";
import { IOIcons, Icon } from "../core/icons";
import { HSpacer } from "../core/spacer/Spacer";
import { LabelHeader } from "../core/typography/LabelHeader";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import { IOColors } from "../core/variables/IOColors";
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
  default: {
    background: string;
    foreground: IOColors;
  };
  selected: {
    background: string;
    foreground: IOColors;
  };
  pressed: {
    background: string;
  };
};

const mapColorStates: Record<NonNullable<TabItem["color"]>, ColorStates> = {
  light: {
    default: {
      background: "#ffffff00",
      foreground: "grey-650"
    },
    selected: {
      background: IOColors["grey-50"],
      foreground: "black"
    },
    pressed: {
      background: IOColors["grey-450"]
    }
  },
  dark: {
    default: {
      background: "#ffffff00",
      foreground: "white"
    },
    selected: {
      background: IOColors.white,
      foreground: "grey-850"
    },
    pressed: {
      background: IOColors["grey-100"]
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
  } = useSpringPressProgressValue(IOSpringValues.button);

  const isSelected: Animated.SharedValue<number> = useSharedValue(0);
  const progressSelected = useDerivedValue(() =>
    withSpring(isSelected.value, IOSpringValues.button)
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
      [
        mapColorStates[color].default.background,
        `${mapColorStates[color].pressed.background}1A`
      ]
    );

    const selectedBackgroundColor = interpolateColor(
      progressSelected.value,
      [0, 1],
      [
        `${mapColorStates[color].pressed.background}1A`,
        mapColorStates[color].selected.background
      ]
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
  });

  const colors = mapColorStates[color][selected ? "selected" : "default"];

  const activeIcon = iconSelected ? (selected ? iconSelected : icon) : icon;

  React.useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isSelected.value = selected ? 1 : 0;
  }, [isSelected, selected]);

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
            <Icon name={activeIcon} color={colors.foreground} size={16} />
            <HSpacer size={4} />
          </>
        )}
        <LabelHeader color={colors.foreground}>{label}</LabelHeader>
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
