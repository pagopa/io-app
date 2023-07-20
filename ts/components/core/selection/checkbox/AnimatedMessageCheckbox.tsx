import React, { useEffect } from "react";
import { StyleSheet, Pressable, PressableProps } from "react-native";
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
  IOSelectionTickVisualParams,
  IOVisualCostants
} from "../../variables/IOStyles";
import { IOSpacingScale } from "../../variables/IOSpacing";

type Props = {
  checked?: boolean;
};

type AnimatedMessageCheckbox = Props &
  Pick<PressableProps, "disabled" | "onPress">;

const internalSpacing: IOSpacingScale = 4;

const styles = StyleSheet.create({
  checkBoxWrapper: {
    width: IOVisualCostants.avatarSizeSmall,
    height: IOVisualCostants.avatarSizeSmall,
    padding: internalSpacing
  },
  checkBoxCircle: {
    position: "absolute",
    left: 0,
    top: 0,
    width: IOVisualCostants.avatarSizeSmall,
    height: IOVisualCostants.avatarSizeSmall,
    borderRadius: IOVisualCostants.avatarSizeSmall
  }
});

/**
 * An animated checkbox. This can be used to implement a
 * standard {@link CheckBox} or other composite components.
 */
export const AnimatedMessageCheckbox = ({
  checked,
  onPress,
  disabled
}: AnimatedMessageCheckbox) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const isChecked = checked ?? true;

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
      duration: 250,
      easing: Easing.out(Easing.cubic)
    });
  }, [checked, circleAnimationProgress, tickAnimationProgress]);

  const animatedCheckboxCircle = useAnimatedStyle(() => {
    const scale = interpolate(circleAnimationProgress.value, [0, 1], [0.8, 1]);
    const opacity = circleAnimationProgress.value;

    return {
      opacity,
      transform: [{ scale }]
    };
  });

  return (
    <Pressable
      disabled={disabled}
      testID="AnimatedMessageCheckboxInput"
      onPress={onPress}
      style={styles.checkBoxWrapper}
    >
      {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following conditions */}
      <Animated.View
        style={[
          styles.checkBoxCircle,
          {
            backgroundColor: isDesignSystemEnabled
              ? IOColors[IOSelectionTickVisualParams.bgColorOnState]
              : IOColors[IOSelectionTickLegacyVisualParams.bgColorOnState]
          },
          animatedCheckboxCircle
        ]}
      />
      {/* REMOVE_LEGACY_COMPONENT: End ▶ */}
      {isChecked && (
        <AnimatedTick
          progress={tickAnimationProgress}
          strokeWidth={1.5}
          stroke={IOColors[IOSelectionTickVisualParams.tickColor]}
        />
      )}
    </Pressable>
  );
};
