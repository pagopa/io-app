import React from "react";
import { ViewStyle } from "react-native";
import {
  AnimatedStyleProp,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

type YSineWaveConfiguration = {
  span: number;
  duration: number;
  enabled?: boolean;
};

type YSineWaveAnimation = {
  animatedStyle: AnimatedStyleProp<ViewStyle>;
};

const useYSineWaveAnimation = ({
  enabled,
  span,
  duration
}: YSineWaveConfiguration): YSineWaveAnimation => {
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: translateY.value
      }
    ]
  }));

  React.useEffect(() => {
    if (enabled) {
      // eslint-disable-next-line functional/immutable-data
      translateY.value = withRepeat(
        withSequence(
          withTiming(-span, {
            duration,
            easing: Easing.inOut(Easing.cubic)
          }),
          withTiming(span, {
            duration,
            easing: Easing.inOut(Easing.cubic)
          })
        ),
        -1,
        true
      );
    } else {
      // eslint-disable-next-line functional/immutable-data
      translateY.value = withTiming(0, {
        duration: duration / 2,
        easing: Easing.inOut(Easing.cubic)
      });
    }
  }, [translateY, span, enabled, duration]);

  return { animatedStyle };
};

export { useYSineWaveAnimation };
