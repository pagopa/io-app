import { hexToRgba, IOColors } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
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
  const duration = 500;
  const isFlipped = useSharedValue(props.isFlipped);
  const shadowColor = hexToRgba(IOColors.black, 0.15);

  React.useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isFlipped.value = props.isFlipped;
  }, [isFlipped, props]);

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    const scaleValue = withSequence(
      withTiming(1.05, { duration: duration / 2 }),
      withTiming(1, { duration: duration / 2 })
    );
    const shadowOpacityValue = withSequence(
      withTiming(0.8, { duration: duration / 2 }),
      withTiming(0, { duration: duration / 2 })
    );

    return {
      transform: [{ rotateY: rotateValue }, { scale: scaleValue }],
      // Shadow styles must be applied only to one card face in order to avoid a "double" shadow
      shadowColor,
      shadowOpacity: shadowOpacityValue,
      shadowRadius: 8
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    const scaleValue = withSequence(
      withTiming(1.05, { duration: 250 }),
      withTiming(1, { duration: 250 })
    );

    return {
      transform: [{ rotateY: rotateValue }, { scale: scaleValue }]
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
