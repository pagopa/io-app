import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as React from "react";
import { useCallback } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import {
  hexToRgba,
  IOColors
} from "../../../components/core/variables/IOColors";

const whiteBgTransparent = hexToRgba(IOColors.white, 0);
const whiteBg = hexToRgba(IOColors.white, 1);
const defaultAnimationDuration = 240 as Millisecond;
export type FlashAnimationState = "fadeIn" | "fadeOut" | undefined;

const styles = StyleSheet.create({
  hover: {
    minWidth: "100%",
    minHeight: "100%",
    bottom: 0,
    left: 0,
    top: 0,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  }
});
type Props = {
  state: FlashAnimationState;
  animationDuration?: Millisecond;
  onFadeInCompleted?: () => void;
  onFadeOutCompleted?: () => void;
};

/* an overlay animated view. it is used when screenshot is captured, to simulate flash effect */
export const FlashAnimatedComponent = (props: Props) => {
  const backgroundAnimation = React.useRef(new Animated.Value(0)).current;
  const animation = React.useRef<Animated.CompositeAnimation>();
  const backgroundInterpolation = backgroundAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [whiteBgTransparent, whiteBg]
  });
  const { state, onFadeInCompleted, onFadeOutCompleted, animationDuration } =
    props;

  const fadeOut = useCallback(() => {
    animation.current?.stop();
    // eslint-disable-next-line functional/immutable-data
    animation.current = Animated.timing(backgroundAnimation, {
      duration: animationDuration ?? defaultAnimationDuration,
      toValue: 0,
      useNativeDriver: false,
      easing: Easing.cubic
    });
    animation.current.start(() => onFadeOutCompleted?.());
  }, [animationDuration, backgroundAnimation, onFadeOutCompleted]);

  const fadeIn = useCallback(() => {
    animation.current?.stop();
    // eslint-disable-next-line functional/immutable-data
    animation.current = Animated.timing(backgroundAnimation, {
      duration: animationDuration ?? defaultAnimationDuration,
      toValue: 1,
      useNativeDriver: false,
      easing: Easing.cubic
    });
    animation.current.start(() => onFadeInCompleted?.());
  }, [backgroundAnimation, onFadeInCompleted, animationDuration]);

  React.useEffect(() => {
    if (state) {
      switch (state) {
        case "fadeIn":
          fadeIn();
          break;
        case "fadeOut":
          fadeOut();
          break;
      }
    }
    return () => {
      animation.current?.stop();
    };
  }, [state, fadeIn, fadeOut]);
  return (
    <Animated.View
      pointerEvents={"none"}
      style={[styles.hover, { backgroundColor: backgroundInterpolation }]}
    />
  );
};
