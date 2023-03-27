import {
  EventListenerCallback,
  EventMapCore,
  StackNavigationState,
  useNavigation
} from "@react-navigation/native";
import { StackNavigationEventMap } from "@react-navigation/stack/lib/typescript/src/types";
import React from "react";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

export const useNavigationSwipeBackListener = (handler: () => void) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const [isSwiping, setIsSwiping] = React.useState(false);

  const handleTransitionEnd = React.useCallback<
    EventListenerCallback<
      StackNavigationEventMap &
        EventMapCore<StackNavigationState<AppParamsList>>,
      "transitionEnd"
    >
  >(
    e => {
      if (e.data.closing) {
        handler();
      }
      setIsSwiping(false);
    },
    [handler]
  );

  const handleGestureStart = React.useCallback<
    EventListenerCallback<
      StackNavigationEventMap &
        EventMapCore<StackNavigationState<AppParamsList>>,
      "gestureStart"
    >
  >(() => setIsSwiping(true), [setIsSwiping]);

  React.useEffect(
    () =>
      isSwiping
        ? navigation.addListener("transitionEnd", handleTransitionEnd)
        : undefined,
    [navigation, isSwiping, handleTransitionEnd]
  );

  React.useEffect(
    () => navigation.addListener("gestureStart", handleGestureStart),
    [navigation, handleGestureStart]
  );
};
