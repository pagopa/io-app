import * as React from "react";
import Animated, {
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { IOSpringValues } from "@pagopa/io-app-design-system";

export const useSpringPressProgressValue = (
  springValue = IOSpringValues.button
) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  const progress = useDerivedValue(() =>
    withSpring(isPressed.value, springValue)
  );

  const onPressIn = React.useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = React.useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  return { onPressIn, onPressOut, progress };
};
