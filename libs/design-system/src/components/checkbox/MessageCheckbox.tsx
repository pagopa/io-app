import { useEffect } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IOSpringValues } from "../../core/IOAnimations";
import { IODimensions, IODimensionScale } from "../../core/tokens";
import { AnimatedTick } from "../common/AnimatedTick";

type MessageCheckbox = Pick<PressableProps, "accessible" | "onPress"> & Props;

type Props = {
  checked?: boolean;
};

const internalSpacing: IODimensionScale = 4;

const styles = StyleSheet.create({
  checkBoxWrapper: {
    width: IODimensions.size.avatar.small,
    height: IODimensions.size.avatar.small,
    padding: internalSpacing
  },
  checkBoxShape: {
    position: "absolute",
    left: 0,
    top: 0,
    width: IODimensions.size.avatar.small,
    height: IODimensions.size.avatar.small,
    borderRadius: IODimensions.radius.avatar.small,
    borderCurve: "continuous"
  }
});

/**
 * Animated message checkbox used for the specific message list item (Select
 * mode that enables related actions)
 */
export const MessageCheckbox = ({
  accessible,
  checked,
  onPress
}: MessageCheckbox) => {
  const checkboxColors = useIOColors().component.checkbox;
  const isChecked = !!checked;

  const shapeAnimationProgress = useSharedValue(checked ? 1 : 0);
  const tickAnimationProgress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    shapeAnimationProgress.value = withSpring(
      checked ? 1 : 0,
      IOSpringValues.selection
    );
    tickAnimationProgress.value = withTiming(checked ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic)
    });
  }, [checked, shapeAnimationProgress, tickAnimationProgress]);

  const animatedCheckboxShape = useAnimatedStyle(() => {
    const scale = interpolate(shapeAnimationProgress.value, [0, 1], [0.8, 1]);
    const opacity = shapeAnimationProgress.value;

    return {
      opacity,
      transform: [{ scale }]
    };
  });

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessible={accessible}
      onPress={onPress}
      style={styles.checkBoxWrapper}
      testID="MessageCheckboxInput"
    >
      <Animated.View
        style={[
          styles.checkBoxShape,
          { backgroundColor: checkboxColors.background },
          animatedCheckboxShape
        ]}
      />
      {isChecked && (
        <AnimatedTick
          progress={tickAnimationProgress}
          stroke={checkboxColors.foreground}
          strokeWidth={1.5}
        />
      )}
    </Pressable>
  );
};
