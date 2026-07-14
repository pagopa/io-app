import { useCallback } from "react";
import { GestureResponderEvent } from "react-native";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { IOSpringValues } from "../../core";

export const useSpringPressProgressValue = (
  springValue: IOSpringValues = "button"
): {
  progress: SharedValue<number>;
  onPressIn: (event: GestureResponderEvent) => void;
  onPressOut: (event: GestureResponderEvent) => void;
} => {
  const isPressed: SharedValue<number> = useSharedValue(0);

  const progress = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues[springValue])
  );

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  return { onPressIn, onPressOut, progress };
};
