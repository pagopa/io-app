import React, { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolate
} from "react-native-reanimated";
import { calculateSlop } from "../../accessibility";
import { IOColors } from "../../variables/IOColors";
import { Icon } from "../../icons/Icon";

type Props = {
  // the value of the checkbox
  checked?: boolean;
};

type OwnProps = Props & Pick<PressableProps, "disabled" | "onPress">;

const SIZE: number = 24;
const BORDER_WIDTH: number = 2;

const offColor: IOColors = "grey-450";
const onColor: IOColors = "blueIO-500";
const slop = calculateSlop(SIZE);
const tickSize = SIZE;

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
    borderColor: IOColors.blue,
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

const getBorderColor = (value: boolean) =>
  value ? IOColors[onColor] : IOColors[offColor];

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
    animationProgress.value = withTiming(checked ? 1 : 0, {
      duration: 300,
      easing: Easing.elastic(1.5)
    });
  }, [checked, animationProgress]);

  const boxStyle = useAnimatedStyle(() => {
    const scale = interpolate(animationProgress.value, [0, 1], [0.8, 1]);
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
      <View
        style={[
          styles.checkboxBorder,
          {
            borderColor: getBorderColor(isChecked)
          }
        ]}
      />
      <Animated.View
        style={[
          styles.checkBoxInner,
          { backgroundColor: IOColors[onColor] },
          boxStyle
        ]}
      />
      {isChecked && (
        <View>
          <Icon name="completed" size={tickSize} color="white" />
        </View>
      )}
    </Pressable>
  );
};
