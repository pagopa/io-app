import { ReactElement, useEffect, memo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

const DEFAULT_DURATION = 500;

export type FlippableCardProps = {
  FrontComponent: ReactElement;
  BackComponent: ReactElement;
  duration?: number;
  isFlipped?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Renders a component which can be flipped to show both of its sides with an animation.
 */
const FlippableCard = ({
  FrontComponent,
  BackComponent,
  containerStyle,
  duration = DEFAULT_DURATION,
  isFlipped: _isFlipped
}: FlippableCardProps) => {
  // Use a numeric shared value (0 = front, 1 = back) so withTiming can animate
  // it smoothly. Driving withTiming on the shared value (rather than inside
  // useAnimatedStyle) is the correct Reanimated pattern and avoids jitter.
  const rotation = useSharedValue(_isFlipped ? 1 : 0);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    rotation.value = withTiming(_isFlipped ? 1 : 0, { duration });
  }, [rotation, _isFlipped, duration]);

  const regularCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }
    ]
  }));

  const flippedCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${interpolate(rotation.value, [0, 1], [180, 360])}deg` }
    ]
  }));

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[styles.card, styles.front, regularCardAnimatedStyle]}
      >
        {FrontComponent}
      </Animated.View>
      <Animated.View
        style={[styles.card, styles.back, flippedCardAnimatedStyle]}
      >
        {BackComponent}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  front: {
    zIndex: 1,
    backfaceVisibility: "hidden"
  },
  back: {
    backfaceVisibility: "hidden",
    zIndex: 2
  }
});

const MemoizedFlippableCard = memo(FlippableCard);

export { MemoizedFlippableCard as FlippableCard };
