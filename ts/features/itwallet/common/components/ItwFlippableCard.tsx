import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

export type ItwFlippableCardProps = {
  FrontComponent: React.ReactElement;
  RearComponent: React.ReactElement;
  isFlipped?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Renders a component which can be flipped with an animation to show both of its sides.
 */
export const ItwFlippableCard = ({
  FrontComponent,
  RearComponent,
  containerStyle,
  ...props
}: ItwFlippableCardProps) => {
  const duration = 1000;
  const isFlipped = useSharedValue(props.isFlipped);

  React.useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isFlipped.value = props.isFlipped;
  }, [isFlipped, props]);

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [{ rotateY: rotateValue }]
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [{ rotateY: rotateValue }]
    };
  });

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[styles.card, styles.regularCard, regularCardAnimatedStyle]}
      >
        {FrontComponent}
      </Animated.View>
      <Animated.View
        style={[styles.card, styles.flippedCard, flippedCardAnimatedStyle]}
      >
        {RearComponent}
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
  regularCard: {
    zIndex: 1
  },
  flippedCard: {
    backfaceVisibility: "hidden",
    zIndex: 2
  }
});
