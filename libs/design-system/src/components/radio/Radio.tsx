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

import { useIOColors } from "../../context";
import { IOSpringValues } from "../../core/IOAnimations";
import { IODimensions } from "../../core/tokens";
import { AnimatedTick } from "../common/AnimatedTick";

type OwnProps = Pick<PressableProps, "disabled" | "onPress"> & Props;

type Props = {
  checked?: boolean;
  size: number;
};

const styles = StyleSheet.create({
  radioBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    borderWidth: IODimensions.stroke.selection.control
  },
  radioCircle: {
    position: "absolute",
    left: 0,
    top: 0
  }
});

/**
 * Animated radio input, used by {@link RadioButtonLabel} and the
 * `ListItemRadio*` components.
 */
export const Radio = ({ size, checked, onPress, disabled }: OwnProps) => {
  const radioColors = useIOColors().component.radio;
  const isChecked = checked ?? false;

  const circleAnimationProgress = useSharedValue(checked ? 1 : 0);
  const tickAnimationProgress = useSharedValue(checked ? 1 : 0);

  const radioButtonSizeStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2
  };

  const radioButtonWrapperSizeStyle: ViewStyle = {
    width: size,
    height: size
  };

  useEffect(() => {
    circleAnimationProgress.value = withSpring(
      checked ? 1 : 0,
      IOSpringValues.selection
    );
    tickAnimationProgress.value = withTiming(checked ? 1 : 0, {
      duration: 400,
      easing: Easing.elastic(1)
    });
  }, [checked, circleAnimationProgress, tickAnimationProgress]);

  const animatedCheckboxSquare = useAnimatedStyle(() => {
    const scale = interpolate(circleAnimationProgress.value, [0, 1], [0.5, 1]);
    const opacity = circleAnimationProgress.value;

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
      style={radioButtonWrapperSizeStyle}
      testID="RadioInput"
    >
      <View
        style={[
          styles.radioBorder,
          radioButtonSizeStyle,
          { borderColor: radioColors.border }
        ]}
      />
      <Animated.View
        style={[
          styles.radioCircle,
          radioButtonSizeStyle,
          { backgroundColor: radioColors.background },
          animatedCheckboxSquare
        ]}
      />
      {isChecked && (
        <View>
          <AnimatedTick
            progress={tickAnimationProgress}
            size={size}
            stroke={radioColors.foreground}
          />
        </View>
      )}
    </Pressable>
  );
};
