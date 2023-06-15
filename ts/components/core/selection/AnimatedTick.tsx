import React, { useState } from "react";
import Animated, {
  useAnimatedProps,
  useAnimatedRef
} from "react-native-reanimated";
import Svg, { Path, PathProps } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedTickProps extends PathProps {
  progress: Animated.SharedValue<number>;
  onLayout?: () => void;
}

// Tick is designed to be within a 24x24 box
const TickSVGPath = "m7 12 4 4 7-7";

/**
 * Animated tick used as a small brick for the selection components (e.g: Checkbox, Radio, etc…)
 * It comes without any state logic.
 *
 */
export const AnimatedTick = ({ progress, ...pathProps }: AnimatedTickProps) => {
  const [length, setLength] = useState(0);
  const ref = useAnimatedRef();

  // SVG trick to animate the checkmark
  // Ref: https://github.com/craftzdog/react-native-checkbox-reanimated/blob/master/src/animated-stroke.tsx
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: Math.max(0, length - length * progress.value - 0.1)
  }));

  const onLayout = () => {
    // "as any" to fix an annoying TS error.
    // I honestly don't know which type to use
    const currentRef = ref.current as any;
    setLength(currentRef.getTotalLength());
  };

  return (
    <Svg viewBox="0 0 24 24">
      <AnimatedPath
        ref={ref}
        onLayout={onLayout}
        d={TickSVGPath}
        animatedProps={animatedProps}
        strokeDasharray={length}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...pathProps}
      />
    </Svg>
  );
};
