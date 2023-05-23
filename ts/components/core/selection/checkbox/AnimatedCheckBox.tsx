import React, { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  useAnimatedProps,
  useAnimatedRef
} from "react-native-reanimated";
import Svg, { Path, PathProps } from "react-native-svg";
import { calculateSlop } from "../../accessibility";
import { IOColors } from "../../variables/IOColors";
import { IOSpringValues } from "../../variables/IOAnimations";

type Props = {
  checked?: boolean;
};

type OwnProps = Props & Pick<PressableProps, "disabled" | "onPress">;

const SIZE: number = 24;
const BORDER_WIDTH: number = 2;

const offColor: IOColors = "grey-650";
const onColor: IOColors = "blueIO-500";
const checkBoxRadius: number = 5;
const slop = calculateSlop(SIZE);

const checkMarkPath = "m7 12 4 4 7-7";

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
    borderRadius: checkBoxRadius
  },
  checkBoxInner: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: checkBoxRadius
  }
});

// Animated checkmark

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedCheckmarkProps extends PathProps {
  progress: Animated.SharedValue<number>;
  onLayout?: () => void;
}

const AnimatedCheckmark = ({
  progress,
  ...pathProps
}: AnimatedCheckmarkProps) => {
  const [length, setLength] = useState(0);
  const ref = useAnimatedRef();

  // SVG trick to animate the checkmark
  // Ref: https://github.com/craftzdog/react-native-checkbox-reanimated/blob/master/src/animated-stroke.tsx
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: Math.max(0, length - length * progress.value - 0.1)
  }));

  const onLayout = () => {
    // "as any" to fix an annoying TS error.
    // I honestly don't know which type to use
    const currentRef = ref.current as any;
    setLength(currentRef.getTotalLength());
  };

  return (
    <Svg viewBox="0 0 24 24">
      <AnimatedPath
        ref={ref}
        onLayout={onLayout}
        animatedProps={animatedProps}
        strokeDasharray={length}
        {...pathProps}
      />
    </Svg>
  );
};

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
          <AnimatedCheckmark
            progress={animationProgress}
            d={checkMarkPath}
            stroke={IOColors.white}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </View>
      )}
    </Pressable>
  );
};
