import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";

import {
  AppParamsList,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";

/**
 * Tells whether the modal hosting the current screen has finished its opening
 * transition.
 *
 * On Android, Reanimated animations (e.g. skeleton pulse, layout fade-in)
 * commit to the shadow tree and reset the native-driven stack transition,
 * hiding the modal until it ends. Use this hook to mount them only once the
 * modal is fully opened.
 *
 * @returns `true` once the parent stack emits `transitionEnd`, or immediately
 *   if the screen has no parent navigator
 */
export const useHasModalTransitionEnded = () => {
  const navigation = useIONavigation();
  const [hasTransitionEnded, setHasTransitionEnded] = useState(
    () => navigation.getParent() === undefined
  );

  useEffect(
    () =>
      navigation
        .getParent<StackNavigationProp<AppParamsList>>()
        ?.addListener("transitionEnd", () => setHasTransitionEnded(true)),
    [navigation]
  );

  return hasTransitionEnded;
};
