import { ReactNode } from "react";
import {
  Directions,
  Gesture,
  GestureDetector
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

const directions = {
  updown: Directions.UP + Directions.DOWN,
  leftright: Directions.LEFT + Directions.RIGHT
};

type FlipsGestureDetectorProps = {
  isFlipped: boolean;
  setIsFlipped: (isFlipped: boolean) => void;
  children: ReactNode;
  direction?: keyof typeof directions;
};

/**
 * This component wraps the children in a GestureDetector that flips the card when the user flicks left or right.
 */
export const FlipGestureDetector = ({
  isFlipped,
  setIsFlipped,
  children,
  direction = "leftright"
}: FlipsGestureDetectorProps) => {
  const flipGesture = Gesture.Fling()
    .direction(directions[direction])
    .onEnd(() => runOnJS(setIsFlipped)(!isFlipped));

  return <GestureDetector gesture={flipGesture}>{children}</GestureDetector>;
};
