import { useCallback, useState } from "react";
import { StyleSheet, type LayoutChangeEvent } from "react-native";
import {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { IOSpacingScale, IOSpringValues } from "../core";

const accordionBodySpacing: IOSpacingScale = 16;

type Params = {
  defaultExpanded?: boolean;
};

export const useAccordionAnimation = ({
  defaultExpanded = false
}: Params = {}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  // Disable animation when starting expanded
  const animationEnabled = useSharedValue(!defaultExpanded);
  const bodyHeight = useSharedValue(0);

  const toggleAccordion = useCallback(() => {
    // Re-enable animation when the user interacts with the accordion
    animationEnabled.value = true; // eslint-disable-line functional/immutable-data
    setExpanded(expanded => !expanded);
  }, [animationEnabled]);

  const iconAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotate: withSpring(
            expanded ? "180deg" : "0deg",
            IOSpringValues.accordion
          )
        }
      ]
    }),
    [expanded]
  );

  // The code below is a re-adaptation of Dima Portenko's code:
  // https://github.com/dimaportenko/reanimated-collapsable-card-tutorial
  const onBodyLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height: onLayoutHeight } = event.nativeEvent.layout;

      if (onLayoutHeight > 0 && bodyHeight.value !== onLayoutHeight) {
        bodyHeight.value = onLayoutHeight; // eslint-disable-line functional/immutable-data
      }
    },
    [bodyHeight]
  );

  const bodyAnimatedHeight = useAnimatedStyle(() => {
    const nextHeight = expanded ? bodyHeight.value : 0;
    return {
      height: animationEnabled.value
        ? withSpring(nextHeight, IOSpringValues.accordion)
        : nextHeight
    };
  });

  const bodyAnimatedStyle = [
    bodyAnimatedHeight,
    styles.accordionCollapsableContainer
  ];
  const bodyInnerStyle = styles.accordionBodyContainer;

  const progress = useDerivedValue(() => {
    const to = expanded ? 1 : 0;
    return animationEnabled.value
      ? withSpring(to, IOSpringValues.accordion)
      : to;
  }, [expanded]);

  return {
    expanded,
    /**
     * Toggle the accordion expanded/collapsed state.
     */
    toggleAccordion,
    /**
     * The style to apply to the accordion icon.
     */
    iconAnimatedStyle,
    /**
     * Callback to execute on the body's inner container layout.
     */
    onBodyLayout,
    /**
     * The animated style to apply to the collapsible body container – it must be an `Animated.View`.
     */
    bodyAnimatedStyle,
    /**
     * The style to apply to the inner body container.
     */
    bodyInnerStyle,
    /**
     * The progress of the accordion animation, from 0 (collapsed) to 1 (expanded).
     */
    progress
  };
};

const styles = StyleSheet.create({
  accordionCollapsableContainer: {
    overflow: "hidden"
  },
  accordionBodyContainer: {
    position: "absolute",
    padding: accordionBodySpacing,
    width: "100%",
    paddingTop: 0
  }
});
