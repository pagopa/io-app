import React, { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  useAnimatedProps,
  useAnimatedRef,
  withTiming,
  Easing
} from "react-native-reanimated";
import Svg, { Path, PathProps } from "react-native-svg";
import { calculateSlop } from "../../accessibility";
import { IOColors } from "../../variables/IOColors";
import { IOSpringValues } from "../../variables/IOAnimations";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";

type Props = {
  checked?: boolean;
};

type OwnProps = Props & Pick<PressableProps, "disabled" | "onPress">;

const SIZE: number = 24;
const BORDER_WIDTH: number = 2;

const borderColorOFF: IOColors = "grey-650";
const backgroundColorON: IOColors = "blueIO-500";
const checkBoxRadius: number = 5;
const slop = calculateSlop(SIZE);
/* Legacy visual parameters */
const borderColorLegacyOFF: IOColors = "bluegrey";
const backgroundColorLegacyON: IOColors = "blue";

const checkMarkPath = "m7 12 4 4 7-7";

const styles = StyleSheet.create({
  checkBoxWrapper: {
    width: SIZE,
    height: SIZE
  },
  checkboxBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
    borderWidth: BORDER_WIDTH,
    borderRadius: checkBoxRadius
  },
  checkBoxSquare: {
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
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isChecked = checked ?? false;

  const squareAnimationProgress = useSharedValue(checked ? 1 : 0);
  const checkmarkAnimationProgress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    squareAnimationProgress.value = withSpring(
      checked ? 1 : 0,
      IOSpringValues.selection
    );
    // eslint-disable-next-line functional/immutable-data
    checkmarkAnimationProgress.value = withTiming(checked ? 1 : 0, {
      duration: 400,
      easing: Easing.elastic(1)
    });
  }, [checked, squareAnimationProgress, checkmarkAnimationProgress]);

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
      disabled={disabled}
      testID="AnimatedCheckbox"
      onPress={onPress}
      hitSlop={{ bottom: slop, left: slop, right: slop, top: slop }}
      style={styles.checkBoxWrapper}
    >
      {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following conditions */}
      <View
        style={[
          styles.checkboxBorder,
          {
            borderColor: isDesignSystemEnabled
              ? IOColors[borderColorOFF]
              : IOColors[borderColorLegacyOFF]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.checkBoxSquare,
          {
            backgroundColor: isDesignSystemEnabled
              ? IOColors[backgroundColorON]
              : IOColors[backgroundColorLegacyON]
          },
          animatedCheckboxSquare
        ]}
      />
      {/* REMOVE_LEGACY_COMPONENT: End ▶ */}
      {isChecked && (
        <View>
          <AnimatedCheckmark
            progress={checkmarkAnimationProgress}
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
