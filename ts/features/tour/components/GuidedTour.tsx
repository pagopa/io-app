/* eslint-disable functional/immutable-data */
import { PropsWithChildren, useEffect } from "react";
import Animated, {
  measure,
  useAnimatedRef,
  useFrameCallback
} from "react-native-reanimated";
import { useIOSelector } from "../../../store/hooks";
import {
  activeGroupIdSelector,
  activeStepIndexSelector,
  tourItemsForActiveGroupSelector
} from "../store/selectors";
import { useTourContext } from "./TourProvider";

type GuidedTourProps = {
  groupId: string;
  index: number;
  title: string;
  description: string;
};

export const GuidedTour = (props: PropsWithChildren<GuidedTourProps>) => {
  const animatedRef = useAnimatedRef<Animated.View>();
  const {
    registerItem,
    unregisterItem,
    cutoutX,
    cutoutY,
    cutoutW,
    cutoutH,
    isTracking,
    overlayAnimatedRef
  } = useTourContext();

  const activeGroupId = useIOSelector(activeGroupIdSelector);
  const stepIndex = useIOSelector(activeStepIndexSelector);
  const items = useIOSelector(tourItemsForActiveGroupSelector);

  const isActiveItem =
    activeGroupId === props.groupId &&
    items.length > 0 &&
    items[stepIndex]?.index === props.index;

  useEffect(() => {
    registerItem(props.groupId, props.index, animatedRef, {
      title: props.title,
      description: props.description
    });

    return () => {
      unregisterItem(props.groupId, props.index);
    };
  }, [
    registerItem,
    unregisterItem,
    props.groupId,
    props.index,
    props.title,
    props.description,
    animatedRef
  ]);

  /**
   * Continuous position tracking on the UI thread.
   * When this item is the active tour step and tracking is enabled,
   * measure the element every frame and update the cutout shared values.
   * This keeps the cutout aligned even when the layout shifts
   * (e.g. offline banner, keyboard, orientation change).
   */
  const frameCallback = useFrameCallback(() => {
    "worklet";
    if (!isTracking.value) {
      return;
    }

    const target = measure(animatedRef);
    if (!target) {
      return;
    }

    // Convert to overlay-relative coordinates
    const overlay = measure(overlayAnimatedRef);
    const ox = overlay?.pageX ?? 0;
    const oy = overlay?.pageY ?? 0;

    const newX = target.pageX - ox;
    const newY = target.pageY - oy;

    // Only update when the position actually changed to avoid
    // unnecessary Skia canvas redraws.
    if (
      newX !== cutoutX.value ||
      newY !== cutoutY.value ||
      target.width !== cutoutW.value ||
      target.height !== cutoutH.value
    ) {
      cutoutX.value = newX;
      cutoutY.value = newY;
      cutoutW.value = target.width;
      cutoutH.value = target.height;
    }
  }, false);

  useEffect(() => {
    frameCallback.setActive(isActiveItem);
  }, [isActiveItem, frameCallback]);

  return <Animated.View ref={animatedRef}>{props.children}</Animated.View>;
};
