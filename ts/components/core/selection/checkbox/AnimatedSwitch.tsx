import React, { useEffect } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { IOColors, IOSpringValues } from "@pagopa/io-app-design-system";
import { IOSwitchVisualParams } from "../../variables/IOStyles";
import { AnimatedTick } from "../AnimatedTick";

type Props = {
  checked?: boolean;
};

type OwnProps = Props & Pick<PressableProps, "disabled" | "onPress">;

const SWITCH_CIRCLE_SIZE =
  IOSwitchVisualParams.height - IOSwitchVisualParams.padding * 2;

const styles = StyleSheet.create({
  switchWrapper: {
    width: IOSwitchVisualParams.width,
    height: IOSwitchVisualParams.height
  },
  switchBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    borderRadius: IOSwitchVisualParams.width,
    backgroundColor: IOColors[IOSwitchVisualParams.bgColorOffState]
  },
  switchCircle: {
    position: "absolute",
    left: IOSwitchVisualParams.padding,
    top: IOSwitchVisualParams.padding,
    backgroundColor: IOColors[IOSwitchVisualParams.bgCircle],
    width: SWITCH_CIRCLE_SIZE,
    height: SWITCH_CIRCLE_SIZE,
    borderRadius: IOSwitchVisualParams.width
  }
});

/**
 * An animated checkbox. This can be used to implement a standard {@link CheckBox} or other composite components.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the AnimatedSwitch of the @pagopa/io-app-design-system library.
 *
 */
export const AnimatedSwitch = ({ checked, onPress, disabled }: OwnProps) => {
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

  const animatedSwitchBg = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        squareAnimationProgress.value,
        [0, 1],
        [
          IOColors[IOSwitchVisualParams.bgColorOffState],
          IOColors[IOSwitchVisualParams.bgColorOnState]
        ]
      )
    }),
    [squareAnimationProgress]
  );

  const animatedSwitchCircle = useAnimatedStyle(() => {
    const translateX = interpolate(
      squareAnimationProgress.value,
      [0, 1],
      [
        0,
        IOSwitchVisualParams.width -
          SWITCH_CIRCLE_SIZE -
          2 * IOSwitchVisualParams.padding
      ]
    );

    return {
      transform: [{ translateX }]
    };
  });

  const animatedSwitchTick = useAnimatedStyle(() => ({
    opacity: tickAnimationProgress.value
  }));

  return (
    <Pressable
      disabled={disabled}
      testID="AnimatedSwitch"
      onPress={onPress}
      style={styles.switchWrapper}
    >
      <Animated.View style={[styles.switchBackground, animatedSwitchBg]} />
      <Animated.View style={[styles.switchCircle, animatedSwitchCircle]}>
        <Animated.View style={animatedSwitchTick}>
          <AnimatedTick
            progress={tickAnimationProgress}
            stroke={IOColors[IOSwitchVisualParams.tickColor]}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
