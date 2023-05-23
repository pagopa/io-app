import React, { useEffect } from "react";
import { StyleSheet, View, Pressable, PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolate,
  withSpring
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { calculateSlop } from "../../accessibility";
import { IOColors } from "../../variables/IOColors";
import { IOSpringValues } from "../../variables/IOAnimations";

type Props = {
  // the value of the checkbox
  checked?: boolean;
};

type OwnProps = Props & Pick<PressableProps, "disabled" | "onPress">;

const SIZE: number = 24;
const BORDER_WIDTH: number = 2;

const offColor: IOColors = "grey-650";
const onColor: IOColors = "blueIO-500";
const slop = calculateSlop(SIZE);

const checkMarkPath =
  "M18.7071 8.29289c.3905.39053.3905 1.02369 0 1.41422L12.4142 16c-.781.781-2.0474.7811-2.82841 0l-3.2929-3.2929c-.39052-.3905-.39052-1.0237 0-1.4142.39053-.3905 1.02369-.3905 1.41422 0L11 14.5858l6.2929-6.29291c.3905-.39052 1.0237-.39052 1.4142 0Z";

const styles = StyleSheet.create({
  checkBox: {
    width: SIZE,
    height: SIZE
  },
  checkboxBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
    borderColor: IOColors[offColor],
    borderWidth: BORDER_WIDTH,
    borderRadius: 4
  },
  checkBoxInner: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: 4
  }
});

/**
 * A raw checkbox that follows the style guidelines without any state logic.
 * This can be used to implement a standard {@link CheckBox} or others custom logics.
 *
 * @param props
 * @constructor
 */
export const AnimatedCheckbox = ({ checked, onPress, disabled }: OwnProps) => {
  const isChecked = checked ?? false;

  const animationProgress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    animationProgress.value = withSpring(
      checked ? 1 : 0,
      IOSpringValues.selection
    );
  }, [checked, animationProgress]);

  const boxStyle = useAnimatedStyle(() => {
    const scale = interpolate(animationProgress.value, [0, 1], [0.5, 1]);
    const opacity = animationProgress.value;

    return {
      opacity,
      transform: [{ scale }]
    };
  });

  return (
    <Pressable
      disabled={disabled}
      testID="AnimatedCheckbox"
      onPress={onPress}
      hitSlop={{ bottom: slop, left: slop, right: slop, top: slop }}
      style={styles.checkBox}
    >
      <View style={styles.checkboxBorder} />
      <Animated.View
        style={[
          styles.checkBoxInner,
          { backgroundColor: IOColors[onColor] },
          boxStyle
        ]}
      />
      {isChecked && (
        <View>
          <Svg viewBox="0 0 24 24">
            <Path d={checkMarkPath} fill={IOColors.white} />
          </Svg>
        </View>
      )}
    </Pressable>
  );
};
