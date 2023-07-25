import {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle
} from "react-native-reanimated";
import {
  IOScaleValues,
  IOSpringValues
} from "../../../core/variables/IOAnimations";
import {
  IOColors,
  hexToRgba,
  useIOTheme
} from "../../../core/variables/IOColors";
import { useSpringPressProgressValue } from "./useSpringPressProgressValue";

export const useListItemBaseSpringAnimation = () => {
  const theme = useIOTheme();

  const { onPressIn, onPressOut, progress } = useSpringPressProgressValue(
    IOSpringValues.button
  );

  const mapBackgroundStates: Record<string, string> = {
    default: hexToRgba(IOColors[theme["listItem-pressed"]], 0),
    pressed: IOColors[theme["listItem-pressed"]]
  };

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.basicButton?.pressedState;

  // Interpolate animation values from `isPressed` values
  // eslint-disable-next-line sonarjs/no-identical-functions
  const animatedScaleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [mapBackgroundStates.default, mapBackgroundStates.pressed]
    );

    return {
      backgroundColor
    };
  });

  return { onPressIn, onPressOut, animatedScaleStyle, animatedBackgroundStyle };
};
