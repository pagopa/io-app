import { useEffect } from "react";
import { ViewStyle } from "react-native";
import {
  AnimatedStyle,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

type SineWaveConfiguration = {
  span: number;
  duration: number;
  axis: "x" | "y";
  enabled?: boolean;
};

type SineWaveAnimation = {
  animatedStyle: AnimatedStyle<ViewStyle>;
};

const useSineWaveAnimation = ({
  span,
  duration,
  axis,
  enabled
}: SineWaveConfiguration): SineWaveAnimation => {
  const translate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      axis === "x"
        ? { translateX: translate.value }
        : { translateY: translate.value }
    ]
  }));

  useEffect(() => {
    if (enabled) {
      // eslint-disable-next-line functional/immutable-data
      translate.value = withRepeat(
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
      translate.value = withTiming(0, {
        duration: duration / 2,
        easing: Easing.inOut(Easing.cubic)
      });
    }
  }, [translate, span, enabled, duration]);

  return { animatedStyle };
};

export { useSineWaveAnimation };
