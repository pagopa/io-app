import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

import { useIOColors } from "../../context";
import { IOSpringValues } from "../../core";

export type ProgressLoader = {
  accessibilityLabel?: string;
  progress: number;
};

/**
 * ProgressLoader component
 *
 * @param progress - The progress percentage
 */
export const ProgressLoader = ({
  progress,
  accessibilityLabel
}: ProgressLoader) => {
  const progressLoaderColors = useIOColors().component.progressLoader;
  const [width, setWidth] = useState(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
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
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progress
      }}
      accessible={true}
      focusable
      importantForAccessibility="yes"
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
      /* We set a fixed height to make the component focusable on Android */
      style={{
        width: "100%",
        height: 16,
        justifyContent: "center",
        backgroundColor: progressLoaderColors.background
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          { height: 4, backgroundColor: progressLoaderColors.foreground }
        ]}
      />
    </View>
  );
};
