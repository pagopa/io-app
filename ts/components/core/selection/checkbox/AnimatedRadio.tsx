import {
  AnimatedRadio as DSAnimatedRadio,
  IOSpringValues,
  IOColors
} from "@pagopa/io-app-design-system";

import React, { useEffect } from "react";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";
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
import {
  IOSelectionTickLegacyVisualParams,
  IOSelectionTickVisualParams
} from "../../variables/IOStyles";
import { AnimatedTick } from "../AnimatedTick";

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
 * An animated checkbox. This can be used to implement a standard {@link CheckBox} or other composite components.
 * Currently if the Design System is enabled, the component returns the AnimatedRadio of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the AnimatedRadio of the @pagopa/io-app-design-system library.
 *
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

  return isDesignSystemEnabled ? (
    <DSAnimatedRadio
      checked={isChecked}
      onPress={onPress}
      disabled={disabled}
    />
  ) : (
    <Pressable
      disabled={disabled}
      testID="AnimatedRadioInput"
      onPress={onPress}
      style={styles.radioWrapper}
    >
      <View
        style={[
          styles.radioBorder,
          {
            borderColor:
              IOColors[IOSelectionTickLegacyVisualParams.borderColorOffState]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.radioCircle,
          {
            backgroundColor:
              IOColors[IOSelectionTickLegacyVisualParams.bgColorOnState]
          },
          animatedCheckboxSquare
        ]}
      />
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
