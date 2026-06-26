import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useIOTheme } from "../../context";
import { IOColors, IOSpringValues } from "../../core";

export type ProgressLoader = {
  progress: number;
  accessibilityLabel?: string;
  color?: IOColors;
};

/**
 * ProgressLoader component
 * @param progress - the progress percentage
 * @param color - IOColors value or undefined to define the color of the progress bar
 */
export const ProgressLoader = ({
  progress,
  accessibilityLabel,
  color: customColor
}: ProgressLoader) => {
  const theme = useIOTheme();
  const [width, setWidth] = useState(0);
  const progressWidth = useSharedValue(0);

  const backgroundColor = IOColors[theme["appBackground-primary"]];
  const foregroundColor = customColor ?? theme["interactiveElem-default"];

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    progressWidth.value = withSpring(
      (progress / 100) * width,
      IOSpringValues.accordion
    );
  }, [progressWidth, progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: progressWidth.value
  }));

  return (
    <View
      focusable
      /* We set a fixed height to make the component focusable on Android */
      style={{
        width: "100%",
        height: 16,
        justifyContent: "center",
        backgroundColor
      }}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
      importantForAccessibility="yes"
      accessibilityLabel={accessibilityLabel}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progress
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          { height: 4, backgroundColor: IOColors[foregroundColor] }
        ]}
      />
    </View>
  );
};
