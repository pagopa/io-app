import React, { useEffect } from "react";
import { StyleSheet, View, Pressable, PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  withTiming,
  Easing
} from "react-native-reanimated";
import { calculateSlop } from "../../accessibility";
import { IOColors } from "../../variables/IOColors";
import { IOSpringValues } from "../../variables/IOAnimations";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { AnimatedTick } from "../AnimatedTick";
import {
  IOSelectionTickLegacyVisualParams,
  IOSelectionTickVisualParams
} from "../../variables/IOStyles";

type Props = {
  checked?: boolean;
};

type OwnProps = Props & Pick<PressableProps, "disabled" | "onPress">;

const checkBoxRadius: number = 5;

const styles = StyleSheet.create({
  checkBoxWrapper: {
    width: IOSelectionTickVisualParams.size,
    height: IOSelectionTickVisualParams.size
  },
  checkboxBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    width: IOSelectionTickVisualParams.size,
    height: IOSelectionTickVisualParams.size,
    borderWidth: IOSelectionTickVisualParams.borderWidth,
    borderRadius: checkBoxRadius
  },
  checkBoxSquare: {
    position: "absolute",
    left: 0,
    top: 0,
    width: IOSelectionTickVisualParams.size,
    height: IOSelectionTickVisualParams.size,
    borderRadius: checkBoxRadius
  }
});

/**
 * An animated checkbox. This can be used to implement a
 * standard {@link CheckBox} or other composite components.
 */
export const AnimatedCheckbox = ({ checked, onPress, disabled }: OwnProps) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isChecked = checked ?? false;

  const squareAnimationProgress = useSharedValue(checked ? 1 : 0);
  const tickAnimationProgress = useSharedValue(checked ? 1 : 0);

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
      disabled={disabled}
      testID="AnimatedCheckboxInput"
      onPress={onPress}
      style={styles.checkBoxWrapper}
    >
      {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following conditions */}
      <View
        style={[
          styles.checkboxBorder,
          {
            borderColor: isDesignSystemEnabled
              ? IOColors[IOSelectionTickVisualParams.borderColorOffState]
              : IOColors[IOSelectionTickLegacyVisualParams.borderColorOffState]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.checkBoxSquare,
          {
            backgroundColor: isDesignSystemEnabled
              ? IOColors[IOSelectionTickVisualParams.bgColorOnState]
              : IOColors[IOSelectionTickLegacyVisualParams.bgColorOnState]
          },
          animatedCheckboxSquare
        ]}
      />
      {/* REMOVE_LEGACY_COMPONENT: End ▶ */}
      {isChecked && (
        <View>
          <AnimatedTick
            progress={tickAnimationProgress}
            stroke={IOColors[IOSelectionTickVisualParams.tickColor]}
          />
        </View>
      )}
    </Pressable>
  );
};
