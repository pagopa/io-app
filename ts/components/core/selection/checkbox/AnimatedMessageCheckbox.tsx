import {
  AnimatedMessageCheckbox as DSAnimatedMessageCheckbox,
  IOColors
} from "@pagopa/io-app-design-system";
import React, { useEffect } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { IOSpringValues } from "../../variables/IOAnimations";
import { IOSpacingScale } from "../../variables/IOSpacing";
import {
  IOSelectionTickLegacyVisualParams,
  IOSelectionTickVisualParams,
  IOVisualCostants
} from "../../variables/IOStyles";
import { AnimatedTick } from "../AnimatedTick";
type Props = {
  checked?: boolean;
};

type AnimatedMessageCheckbox = Props & Pick<PressableProps, "onPress">;

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
 * Animated message checkbox used for the specific message list item (Select mode that enables related actions).
 * Currently if the Design System is enabled, the component returns the AnimatedMessageCheckbox of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the AnimatedMessageCheckbox of the @pagopa/io-app-design-system library.
 *
 */
export const AnimatedMessageCheckbox = ({
  checked,
  onPress
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

  return isDesignSystemEnabled ? (
    <DSAnimatedMessageCheckbox checked={isChecked} onPress={onPress} />
  ) : (
    <Pressable
      testID="AnimatedMessageCheckboxInput"
      onPress={onPress}
      style={styles.checkBoxWrapper}
    >
      <Animated.View
        style={[
          styles.checkBoxCircle,
          {
            backgroundColor:
              IOColors[IOSelectionTickLegacyVisualParams.bgColorOnState]
          },
          animatedCheckboxCircle
        ]}
      />
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
