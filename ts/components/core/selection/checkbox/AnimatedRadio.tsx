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

const styles = StyleSheet.create({
  radioWrapper: {
    width: IOSelectionTickVisualParams.size,
    height: IOSelectionTickVisualParams.size
  },
  radioBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    width: IOSelectionTickVisualParams.size,
    height: IOSelectionTickVisualParams.size,
    borderWidth: IOSelectionTickVisualParams.borderWidth,
    borderRadius: IOSelectionTickVisualParams.size / 2
  },
  radioCircle: {
    position: "absolute",
    left: 0,
    top: 0,
    width: IOSelectionTickVisualParams.size,
    height: IOSelectionTickVisualParams.size,
    borderRadius: IOSelectionTickVisualParams.size / 2
  }
});

/**
 * An animated checkbox. This can be used to implement a
 * standard {@link CheckBox} or other composite components.
 */
export const AnimatedRadio = ({ checked, onPress, disabled }: OwnProps) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isChecked = checked ?? false;

  const circleAnimationProgress = useSharedValue(checked ? 1 : 0);
  const tickAnimationProgress = useSharedValue(checked ? 1 : 0);

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
      disabled={disabled}
      testID="AnimatedRadioInput"
      onPress={onPress}
      style={styles.radioWrapper}
    >
      {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following conditions */}
      <View
        style={[
          styles.radioBorder,
          {
            borderColor: isDesignSystemEnabled
              ? IOColors[IOSelectionTickVisualParams.borderColorOffState]
              : IOColors[IOSelectionTickLegacyVisualParams.borderColorOffState]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.radioCircle,
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
