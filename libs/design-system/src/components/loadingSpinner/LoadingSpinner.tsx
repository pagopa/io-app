import { ReactElement, useId } from "react";
import { ColorValue, View } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

import { useIOTheme } from "../../context";
import { IOColors } from "../../core/IOColors";
import { WithTestID } from "../../utils/types";

/** Size scale */
export type IOLoadingSpinnerSizeScale = 24 | 48;

export type LoadingSpinner = WithTestID<{
  accessibilityHint?: string;
  accessibilityLabel?: string;
  color?: ColorValue;
  durationMs?: number;
  size?: IOLoadingSpinnerSizeScale;
}>;

const spinKeyframes = {
  from: { transform: [{ rotateZ: "0deg" }] },
  to: { transform: [{ rotateZ: "360deg" }] }
};

const strokeMap: Record<IOLoadingSpinnerSizeScale, number> = {
  24: 3,
  48: 5
};

export const LoadingSpinner = ({
  color: customColor,
  size = 24,
  durationMs = 850,
  accessibilityHint,
  accessibilityLabel,
  testID = "LoadingSpinnerTestID"
}: LoadingSpinner): ReactElement => {
  const theme = useIOTheme();
  const id = useId();
  const stroke = strokeMap[size];

  const color = customColor ?? IOColors[theme["interactiveElem-default"]];

  const secondHalfId = `${id}-secondHalf`;
  const firstHalfId = `${id}-firstHalf`;

  return (
    <View
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessible={true}
      style={{ width: size, height: size }}
      testID={testID}
    >
      <Animated.View
        style={{
          animationName: spinKeyframes,
          animationDuration: durationMs,
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
          transformOrigin: "center"
        }}
        testID={"LoadingSpinnerAnimatedTestID"}
      >
        {/* Thanks to Ben Ilegbodu for the article on how to
          create a a SVG gradient loading spinner. Below is
          a parameterized version of his code.
          Source: https://www.benmvp.com/blog/how-to-create-circle-svg-gradient-loading-spinner/ */}
        <Svg
          fill="none"
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          width={size}
        >
          <Defs>
            <LinearGradient id={secondHalfId}>
              <Stop offset="0%" stopColor={color} stopOpacity="0" />
              <Stop offset="100%" stopColor={color} stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id={firstHalfId}>
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          <G strokeWidth={stroke}>
            <Path
              d={`M ${stroke / 2} ${size / 2} A ${size / 2 - stroke / 2} ${
                size / 2 - stroke / 2
              } 0 0 1 ${size - stroke / 2} ${size / 2}`}
              stroke={`url(#${secondHalfId})`}
            />
            <Path
              d={`M ${size - stroke / 2} ${size / 2} A ${
                size / 2 - stroke / 2
              } ${size / 2 - stroke / 2} 0 0 1 ${stroke / 2} ${size / 2}`}
              stroke={`url(#${firstHalfId})`}
            />
            <Path
              d={`M ${stroke / 2} ${size / 2} A ${size / 2 - stroke / 2} ${
                size / 2 - stroke / 2
              } 0 0 1 ${stroke / 2} ${size / 2 - stroke / 4}`}
              stroke={color}
              strokeLinecap="round"
            />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
};
