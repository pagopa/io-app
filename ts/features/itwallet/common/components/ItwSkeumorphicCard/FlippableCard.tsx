import { ReactElement, memo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { createCSSAnimatedComponent } from "react-native-reanimated";

const CSSAnimatedView = createCSSAnimatedComponent(View);

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
  isFlipped
}: FlippableCardProps) => (
  <View style={containerStyle}>
    <CSSAnimatedView
      style={[
        styles.card,
        styles.front,
        {
          transform: [{ rotateY: isFlipped ? "180deg" : "0deg" }],
          transitionProperty: "transform",
          transitionDuration: duration
        }
      ]}
    >
      {FrontComponent}
    </CSSAnimatedView>
    <CSSAnimatedView
      style={[
        styles.card,
        styles.back,
        {
          transform: [{ rotateY: isFlipped ? "360deg" : "180deg" }],
          transitionProperty: "transform",
          transitionDuration: duration
        }
      ]}
    >
      {BackComponent}
    </CSSAnimatedView>
  </View>
);

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
