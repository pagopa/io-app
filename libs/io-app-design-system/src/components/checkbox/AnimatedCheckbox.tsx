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
import { IOSelectionTickVisualParams, IOSpringValues } from "../../core";
import { IOColors } from "../../core/IOColors";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { AnimatedTick } from "../common/AnimatedTick";

type Props = {
  size: number;
  checked?: boolean;
};

type OwnProps = Props & Pick<PressableProps, "disabled" | "onPress">;

const checkBoxRadius: number = 5;

const styles = StyleSheet.create({
  checkboxBorder: {
    borderWidth: IOSelectionTickVisualParams.borderWidth,
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
 * An animated checkbox. This can be used to implement a
 * standard {@link CheckBox} or other composite components.
 */
export const AnimatedCheckbox = ({
  size,
  checked,
  onPress,
  disabled
}: OwnProps) => {
  const theme = useIOTheme();
  const { dynamicFontScale } = useIOFontDynamicScale();
  const isChecked = checked ?? false;

  const borderColor = IOColors[theme["selection-border-off"]];
  const backgroundColor = IOColors[theme["selection-background-on"]];

  const squareAnimationProgress = useSharedValue(checked ? 1 : 0);
  const tickAnimationProgress = useSharedValue(checked ? 1 : 0);

  const checkboxSizeStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: checkBoxRadius * dynamicFontScale
  };

  const checkboxWrapperSizeStyle: ViewStyle = {
    width: size,
    height: size
  };

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    squareAnimationProgress.value = withSpring(
      checked ? 1 : 0,
      IOSpringValues.selection
    );
    // eslint-disable-next-line functional/immutable-data
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
      testID="AnimatedCheckboxInput"
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
            size={size}
            progress={tickAnimationProgress}
            stroke={IOColors[theme["selection-tick"]]}
          />
        </View>
      )}
    </Pressable>
  );
};
