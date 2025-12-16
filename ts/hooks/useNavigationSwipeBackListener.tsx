import { EventListenerCallback } from "@react-navigation/native";
import { StackNavigationEventMap } from "@react-navigation/stack/lib/typescript/src/types";
import { useState, useCallback, useEffect } from "react";
import { useIONavigation } from "../navigation/params/AppParamsList";

/**
 * A custom React hook that attaches a swipe back listener to the navigation stack.
 * When the user swipes back to dismiss the current screen, the handler function will be called.
 * @param handler A function that will be called when the swipe back gesture is completed.
 * @example
 * // In a React functional component:
 * import { useNavigationSwipeBackListener } from 'path/to/useNavigationSwipeBackListener';
 *
 * const MyComponent = () => {
 *     const handleSwipeBack = () => {
 *         console.log("Swipe back!");
 *     };
 *     useNavigationSwipeBackListener(handleSwipeBack);
 *     return (
 *         // JSX for the component
 *     );
 * };
 */
export const useNavigationSwipeBackListener = (handler: () => void) => {
  const navigation = useIONavigation();
  const [withGesture, setWithGesture] = useState(false);

  const handleTransitionEnd = useCallback<
    EventListenerCallback<StackNavigationEventMap, "transitionEnd">
  >(
    ({ data }) => {
      // The handleTransitionEnd callback function is executed when a screen transition is completed.
      // We only need to know if the user is swiping back, regardless of the direction of the transition.
      // Fortunately, the transition event provides this information through the closing property in the data parameter.
      // if it is true, it means that the user is swiping back to the previous screen
      if (data.closing) {
        handler();
      }

      // Finally, everytime the transition ends, we remove the transitionEnd listener by setting withGesture to false.
      setWithGesture(false);
    },
    [handler]
  );

  useEffect(() => {
    // `transitionEnd` event is triggered everytime there is a screen transition, even if not triggered by a gesture.
    //  We need to listen the `transitionEnd` event only after a gesture is started
    if (withGesture) {
      return navigation.addListener("transitionEnd", handleTransitionEnd);
    }

    // If there is no swiping active, do nothing
    return undefined;
  }, [navigation, withGesture, handleTransitionEnd]);

  const handleGestureEnd = useCallback<
    EventListenerCallback<StackNavigationEventMap, "gestureEnd">
  >(() => {
    // Everytime the user ands a swipe gesture (any direction), we save it to the state by mutating `setWithGesture` to true
    setWithGesture(true);
  }, [setWithGesture]);

  useEffect(
    () => navigation.addListener("gestureEnd", handleGestureEnd),
    [navigation, handleGestureEnd]
  );
};
