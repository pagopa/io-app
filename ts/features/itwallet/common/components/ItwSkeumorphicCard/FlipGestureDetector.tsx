import React from "react";
import {
  Directions,
  Gesture,
  GestureDetector
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

type FlipsGestureDetectorProps = {
  isFlipped: boolean;
  setIsFlipped: (isFlipped: boolean) => void;
  children: React.ReactNode;
};

/**
 * This component wraps the children in a GestureDetector that flips the card when the user flicks left or right.
 */
export const FlipGestureDetector = ({
  isFlipped,
  setIsFlipped,
  children
}: FlipsGestureDetectorProps) => {
  const flipGesture = Gesture.Fling()
    .direction(Directions.LEFT + Directions.RIGHT)
    .onEnd(() => runOnJS(setIsFlipped)(!isFlipped));

  return <GestureDetector gesture={flipGesture}>{children}</GestureDetector>;
};
