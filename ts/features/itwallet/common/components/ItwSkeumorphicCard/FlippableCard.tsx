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
  const isFlipped = useSharedValue(_isFlipped);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isFlipped.value = _isFlipped;
  }, [isFlipped, _isFlipped]);

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [{ rotateY: rotateValue }]
    };
  }, []);

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [{ rotateY: rotateValue }]
    };
  }, []);

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
    zIndex: 1
  },
  back: {
    backfaceVisibility: "hidden",
    zIndex: 2
  }
});

const MemoizedFlippableCard = memo(FlippableCard);

export { MemoizedFlippableCard as FlippableCard };
