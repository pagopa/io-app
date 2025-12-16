import { ReactNode } from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { WithTestID } from "../../types/WithTestID";

const windowWidth = Dimensions.get("window").width;

type Dismissable = WithTestID<{
  onDismiss?: () => void;
  dismissThreshold?: number;
  children: ReactNode;
}>;

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
  children,
  testID
}: Dismissable) => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value
      }
    ]
  }));

  const pan = Gesture.Pan()
    .onUpdate(event => {
      // eslint-disable-next-line functional/immutable-data
      translateX.value = event.translationX;
    })
    .onEnd(event => {
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
    })
    .withTestId(testID ?? "");

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
};

export { Dismissable };
