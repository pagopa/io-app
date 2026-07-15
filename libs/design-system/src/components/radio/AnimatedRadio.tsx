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
import { IOSpringValues } from "../../core/IOAnimations";
import { IOColors } from "../../core/IOColors";
import { IOSelectionTickVisualParams } from "../../core/IOStyles";
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
    borderWidth: IOSelectionTickVisualParams.borderWidth
  },
  radioCircle: {
    position: "absolute",
    left: 0,
    top: 0
  }
});

/**
 * An animated checkbox. This can be used to implement a
 * standard {@link CheckBox} or other composite components.
 */
export const AnimatedRadio = ({
  size,
  checked,
  onPress,
  disabled
}: OwnProps) => {
  const theme = useIOTheme();
  const isChecked = checked ?? false;

  const borderColor = IOColors[theme["selection-border-off"]];
  const backgroundColor = IOColors[theme["selection-background-on"]];

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
    // eslint-disable-next-line functional/immutable-data
    circleAnimationProgress.value = withSpring(
      checked ? 1 : 0,
      IOSpringValues.selection
    );
    // eslint-disable-next-line functional/immutable-data
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
      testID="AnimatedRadioInput"
    >
      <View
        style={[styles.radioBorder, radioButtonSizeStyle, { borderColor }]}
      />
      <Animated.View
        style={[
          styles.radioCircle,
          radioButtonSizeStyle,
          { backgroundColor },
          animatedCheckboxSquare
        ]}
      />
      {isChecked && (
        <View>
          <AnimatedTick
            progress={tickAnimationProgress}
            size={size}
            stroke={IOColors[theme["selection-tick"]]}
          />
        </View>
      )}
    </Pressable>
  );
};
