import { ComponentProps } from "react";
import { Image } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

export type AnimatedImageProps = ComponentProps<typeof Image>;

/**
 * AnimatedImage component renders an image with a fade-in animation
 * effect once the image finishes loading.
 *
 * @param {AnimatedImageProps} props - The properties for the AnimatedImage component.
 * @param {object} props.source - The source of the image.
 * @param {object} [props.style] - The style to apply to the image.
 * @returns {JSX.Element} The rendered AnimatedImage component.
 */
export const AnimatedImage = ({ style, ...props }: AnimatedImageProps) => {
  const opacity = useSharedValue(0);

  const handleOnLoad = () => {
    // eslint-disable-next-line functional/immutable-data
    opacity.value = 1;
  };

  const opacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  return (
    <Animated.Image
      {...props}
      style={[opacityTransition, style]}
      onLoad={handleOnLoad}
      accessibilityIgnoresInvertColors={false}
    />
  );
};
