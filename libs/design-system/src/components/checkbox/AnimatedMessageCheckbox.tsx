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
import { useIOTheme } from "../../context";
import { IOSpringValues } from "../../core/IOAnimations";
import { IOColors } from "../../core/IOColors";
import { IOSpacingScale } from "../../core/IOSpacing";
import { IOVisualCostants } from "../../core/IOStyles";
import { AnimatedTick } from "../common/AnimatedTick";

type Props = {
  checked?: boolean;
};

type AnimatedMessageCheckbox = Props &
  Pick<PressableProps, "accessible" | "onPress">;

const internalSpacing: IOSpacingScale = 4;

const styles = StyleSheet.create({
  checkBoxWrapper: {
    width: IOVisualCostants.avatarSizeSmall,
    height: IOVisualCostants.avatarSizeSmall,
    padding: internalSpacing
  },
  checkBoxShape: {
    position: "absolute",
    left: 0,
    top: 0,
    width: IOVisualCostants.avatarSizeSmall,
    height: IOVisualCostants.avatarSizeSmall,
    borderRadius: IOVisualCostants.avatarRadiusSizeSmall,
    borderCurve: "continuous"
  }
});

/**
 * Animated message checkbox used for the specific message
 * list item (Select mode that enables related actions)
 */
export const AnimatedMessageCheckbox = ({
  accessible,
  checked,
  onPress
}: AnimatedMessageCheckbox) => {
  const theme = useIOTheme();
  const isChecked = !!checked;

  const shapeAnimationProgress = useSharedValue(checked ? 1 : 0);
  const tickAnimationProgress = useSharedValue(checked ? 1 : 0);

  const backgroundColor = IOColors[theme["selection-background-on"]];

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    shapeAnimationProgress.value = withSpring(
      checked ? 1 : 0,
      IOSpringValues.selection
    );
    // eslint-disable-next-line functional/immutable-data
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
      accessible={accessible}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      testID="AnimatedMessageCheckboxInput"
      onPress={onPress}
      style={styles.checkBoxWrapper}
    >
      <Animated.View
        style={[
          styles.checkBoxShape,
          { backgroundColor },
          animatedCheckboxShape
        ]}
      />
      {isChecked && (
        <AnimatedTick
          progress={tickAnimationProgress}
          strokeWidth={1.5}
          stroke={IOColors[theme["selection-tick"]]}
        />
      )}
    </Pressable>
  );
};
