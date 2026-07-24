import { configure } from "@testing-library/react-native";
import { Animated } from "react-native";

/**
 * Default value for includeHiddenElements query option for all queries.
 * When set to true all queries will match elements hidden from accessibility.
 * Otherwise tests which queries hidden element for accessibility will fail.
 */
configure({ defaultIncludeHiddenElements: true });

const completeAnimatedStartSynchronously = animation => ({
  ...animation,
  start: callback => {
    callback?.({ finished: true });
  }
});

const originalAnimatedSpring = Animated.spring;
const originalAnimatedTiming = Animated.timing;
const originalAnimatedDecay = Animated.decay;

jest
  .spyOn(Animated, "spring")
  .mockImplementation((...args) =>
    completeAnimatedStartSynchronously(originalAnimatedSpring(...args))
  );

jest
  .spyOn(Animated, "timing")
  .mockImplementation((...args) =>
    completeAnimatedStartSynchronously(originalAnimatedTiming(...args))
  );

jest
  .spyOn(Animated, "decay")
  .mockImplementation((...args) =>
    completeAnimatedStartSynchronously(originalAnimatedDecay(...args))
  );
