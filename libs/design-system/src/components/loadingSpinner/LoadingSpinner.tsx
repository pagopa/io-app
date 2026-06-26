import { ReactElement, useId } from "react";
import { ColorValue, View } from "react-native";
import Animated from "react-native-reanimated";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";
import { useIOTheme } from "../../context";
import { IOColors } from "../../core/IOColors";
import { WithTestID } from "../../utils/types";

export type LoadingSpinner = WithTestID<{
  color?: ColorValue;
  size?: IOLoadingSpinnerSizeScale;
  durationMs?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}>;

/**
 * Size scale
 */
export type IOLoadingSpinnerSizeScale = 24 | 48;

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
      style={{ width: size, height: size }}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Animated.View
        testID={"LoadingSpinnerAnimatedTestID"}
        style={{
          animationName: spinKeyframes,
          animationDuration: durationMs,
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
          transformOrigin: "center"
        }}
      >
        {/* Thanks to Ben Ilegbodu for the article on how to
          create a a SVG gradient loading spinner. Below is
          a parameterized version of his code.
          Source: https://www.benmvp.com/blog/how-to-create-circle-svg-gradient-loading-spinner/ */}
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
        >
          <Defs>
            <LinearGradient id={secondHalfId}>
              <Stop offset="0%" stopOpacity="0" stopColor={color} />
              <Stop offset="100%" stopOpacity="1" stopColor={color} />
            </LinearGradient>
            <LinearGradient id={firstHalfId}>
              <Stop offset="0%" stopOpacity="1" stopColor={color} />
              <Stop offset="100%" stopOpacity="1" stopColor={color} />
            </LinearGradient>
          </Defs>

          <G strokeWidth={stroke}>
            <Path
              stroke={`url(#${secondHalfId})`}
              d={`M ${stroke / 2} ${size / 2} A ${size / 2 - stroke / 2} ${
                size / 2 - stroke / 2
              } 0 0 1 ${size - stroke / 2} ${size / 2}`}
            />
            <Path
              stroke={`url(#${firstHalfId})`}
              d={`M ${size - stroke / 2} ${size / 2} A ${
                size / 2 - stroke / 2
              } ${size / 2 - stroke / 2} 0 0 1 ${stroke / 2} ${size / 2}`}
            />
            <Path
              stroke={color}
              strokeLinecap="round"
              d={`M ${stroke / 2} ${size / 2} A ${size / 2 - stroke / 2} ${
                size / 2 - stroke / 2
              } 0 0 1 ${stroke / 2} ${size / 2 - stroke / 4}`}
            />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
};
