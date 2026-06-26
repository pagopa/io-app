import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { useCallback } from "react";
import { triggerHaptic } from "../../functions";

const SHAKE_OFFSET: number = 8;

export const useErrorShakeAnimation = () => {
  const translate = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value }]
  }));

  const shakeAnimation = useCallback(() => {
    triggerHaptic("notificationError");
    return withSequence(
      withTiming(SHAKE_OFFSET, {
        duration: 75,
        easing: Easing.inOut(Easing.cubic)
      }),
      withTiming(-SHAKE_OFFSET, {
        duration: 75,
        easing: Easing.inOut(Easing.cubic)
      }),
      withTiming(SHAKE_OFFSET / 2, {
        duration: 75,
        easing: Easing.inOut(Easing.cubic)
      }),
      withTiming(-SHAKE_OFFSET / 2, {
        duration: 75,
        easing: Easing.inOut(Easing.cubic)
      }),
      withTiming(0, { duration: 75, easing: Easing.inOut(Easing.cubic) })
    );
  }, []);

  return { translate, animatedStyle, shakeAnimation };
};
