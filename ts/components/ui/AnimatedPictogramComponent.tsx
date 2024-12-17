import * as React from "react";
import LottieView from "lottie-react-native";

export type AnimatedPictogramSource = React.ComponentProps<
  typeof LottieView
>["source"];

type AnimatedPictogramProps = {
  source: AnimatedPictogramSource;
  loop?: boolean;
};

/**
 * AnimatedPictogram component displays an animated Lottie pictogram.
 * It accepts a `source` prop for the Lottie animation file and plays it in a loop.
 * @param {AnimatedPictogramSource} source - The Lottie animation source file,
 * which can be a JSON file, a URL, or an imported Lottie animation object.
 * @param {boolean} loop - Determines if the animation should play in a loop. By default is true
 * @returns {JSX.Element} A centered, looping Lottie animation.
 */
export const AnimatedPictogram = ({
  source,
  loop = true
}: AnimatedPictogramProps) => (
  <LottieView
    autoPlay={true}
    style={{
      width: 124,
      height: 124
    }}
    source={source}
    loop={loop}
  />
);
