import { useEffect } from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IODimensions, IOSpringValues } from "../../core";
import { IOColorsLegacy } from "../../core/IOColors";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { AnimatedTick } from "../common/AnimatedTick";

type OwnProps = Pick<PressableProps, "disabled" | "onPress"> & Props;

type Props = {
  checked?: boolean;
  size: number;
};

const styles = StyleSheet.create({
  checkboxBorder: {
    borderWidth: IODimensions.stroke.selection.control,
    borderCurve: "continuous",
    position: "absolute",
    left: 0,
    top: 0
  },
  checkBoxSquare: {
    borderCurve: "continuous",
    position: "absolute",
    left: 0,
    top: 0
  }
});

/**
 * Animated checkbox input, used by {@link CheckboxLabel} and
 * {@link ListItemCheckbox}.
 */
export const Checkbox = ({ size, checked, onPress, disabled }: OwnProps) => {
  const theme = useIOTheme();
  const { dynamicFontScale } = useIOFontDynamicScale();
  const isChecked = checked ?? false;

  const borderColor = IOColorsLegacy[theme["selection-border-off"]];
  const backgroundColor = IOColorsLegacy[theme["selection-background-on"]];

  const squareAnimationProgress = useSharedValue(checked ? 1 : 0);
  const tickAnimationProgress = useSharedValue(checked ? 1 : 0);

  const checkboxSizeStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: IODimensions.radius.selection.control * dynamicFontScale
  };

  const checkboxWrapperSizeStyle: ViewStyle = {
    width: size,
    height: size
  };

  useEffect(() => {
    squareAnimationProgress.value = withSpring(
      checked ? 1 : 0,
      IOSpringValues.selection
    );
    tickAnimationProgress.value = withTiming(checked ? 1 : 0, {
      duration: 400,
      easing: Easing.elastic(1)
    });
  }, [checked, squareAnimationProgress, tickAnimationProgress]);

  const animatedCheckboxSquare = useAnimatedStyle(() => {
    const scale = interpolate(squareAnimationProgress.value, [0, 1], [0.5, 1]);
    const opacity = squareAnimationProgress.value;

    return {
      opacity,
      transform: [{ scale }]
    };
  });

  return (
    <Pressable
      accessible={false}
      disabled={disabled}
      onPress={onPress}
      style={checkboxWrapperSizeStyle}
      testID="CheckboxInput"
    >
      <View
        style={[styles.checkboxBorder, checkboxSizeStyle, { borderColor }]}
      />
      <Animated.View
        style={[
          styles.checkBoxSquare,
          checkboxSizeStyle,
          { backgroundColor },
          animatedCheckboxSquare
        ]}
      />
      {isChecked && (
        <View style={{ zIndex: 1 }}>
          <AnimatedTick
            progress={tickAnimationProgress}
            size={size}
            stroke={IOColorsLegacy[theme["selection-tick"]]}
          />
        </View>
      )}
    </Pressable>
  );
};
