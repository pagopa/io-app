import React from "react";
import { GestureResponderEvent, Pressable, StyleSheet } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { IOIcons, Icon } from "../core/icons";
import { HSpacer } from "../core/spacer/Spacer";
import { LabelHeader } from "../core/typography/LabelHeader";
import { IOScaleValues, IOSpringValues } from "../core/variables/IOAnimations";
import { IOColors } from "../core/variables/IOColors";
import { WithTestID } from "../../types/WithTestID";

type ColorMode = "light" | "dark";

type TabItem = WithTestID<{
  label: string;
  color?: ColorMode;
  selected?: boolean;
  // Icons
  icon?: IOIcons;
  iconSelected?: IOIcons;
  // Accessibility
  accessibilityLabel: string;
  accessibilityHint?: string;
  // Events
  onPress: (event: GestureResponderEvent) => void;
}>;

type ColorStates = {
  default: {
    background: IOColors;
    foreground: IOColors;
  };
  selected: {
    background: IOColors;
    foreground: IOColors;
  };
};

const mapColorStates: Record<NonNullable<TabItem["color"]>, ColorStates> = {
  light: {
    default: {
      background: "transparent",
      foreground: "grey-650"
    },
    selected: {
      background: "grey-50",
      foreground: "black"
    }
  },
  dark: {
    default: {
      background: "transparent",
      foreground: "white"
    },
    selected: {
      background: "white",
      foreground: "grey-850"
    }
  }
};

const TabItem = ({
  label,
  color = "light",
  selected = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  onPress,
  icon,
  iconSelected
}: TabItem) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.basicButton?.pressedState;

  // Using a spring-based animation for our interpolations
  const progressPressed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const pressedAnimationStyle = useAnimatedStyle(() => {
    // Link color states to the pressed states

    // Scale down button slightly when pressed
    const scale = interpolate(
      progressPressed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const onPressIn = React.useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = React.useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  const colors = mapColorStates[color][selected ? "selected" : "default"];

  const activeIcon = iconSelected ? (selected ? iconSelected : icon) : icon;

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
        style={[
          styles.container,
          { backgroundColor: IOColors[colors.background] },
          pressedAnimationStyle
        ]}
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
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 65,
    alignSelf: "flex-start"
  }
});

export { TabItem };
