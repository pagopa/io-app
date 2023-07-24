import React from "react";
import { Dimensions } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

const windowWidth = Dimensions.get("window").width;

type DismissableGestureEventContext = {
  translateX: number;
};

type Dismissable = {
  onDismiss?: () => void;
  dismissThreshold?: number;
  children: React.ReactNode;
};

/**
 * Component that allows for a dismissable gesture, both left and right.
 * When the threshold is reached, the `onDismiss` callback is called.
 * @param onDismiss Callback to be called when the threshold is reached.
 * @param dismissThreshold Threshold to be reached to call the `onDismiss` callback.
 * @param children Children to be rendered inside the component.
 * @returns A dismissable component.
 */
const Dismissable = ({
  onDismiss = () => undefined,
  dismissThreshold = windowWidth / 3,
  children
}: Dismissable) => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value
      }
    ]
  }));

  const panGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    DismissableGestureEventContext
  >({
    onStart: (_, context) => {
      // eslint-disable-next-line functional/immutable-data
      context.translateX = translateX.value;
    },
    onActive: (event, context) => {
      // eslint-disable-next-line functional/immutable-data
      translateX.value = event.translationX + context.translateX;
    },
    onEnd: event => {
      if (Math.abs(event.translationX) > dismissThreshold) {
        // eslint-disable-next-line functional/immutable-data
        translateX.value = withTiming(
          windowWidth * Math.sign(event.translationX),
          {
            duration: 300,
            easing: Easing.inOut(Easing.exp)
          },
          runOnJS(onDismiss)
        );
      } else {
        // eslint-disable-next-line functional/immutable-data
        translateX.value = withSpring(0, { mass: 0.5 });
      }
    }
  });

  return (
    <PanGestureHandler onGestureEvent={panGestureEvent}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </PanGestureHandler>
  );
};

export { Dismissable };
