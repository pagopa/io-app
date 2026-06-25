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
import { TourCutoutStyle } from "../types";
import { useTourContext } from "./TourProvider";

export type GuidedTourProps = {
  groupId: string;
  index: number;
  title: string;
  description: string;
  cutoutStyle?: TourCutoutStyle;
  cutoutPadding?: number;
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
  const cutoutPadding = props.cutoutPadding ?? 0;

  useEffect(() => {
    registerItem(props.groupId, props.index, animatedRef, {
      title: props.title,
      description: props.description,
      cutoutStyle: props.cutoutStyle,
      cutoutPadding
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
    props.cutoutStyle,
    cutoutPadding,
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

    const paddedX = target.pageX - ox - cutoutPadding;
    const paddedY = target.pageY - oy - cutoutPadding;
    const paddedWidth = target.width + cutoutPadding * 2;
    const paddedHeight = target.height + cutoutPadding * 2;

    // Only update when the position actually changed to avoid
    // unnecessary Skia canvas redraws.
    if (
      paddedX !== cutoutX.value ||
      paddedY !== cutoutY.value ||
      paddedWidth !== cutoutW.value ||
      paddedHeight !== cutoutH.value
    ) {
      cutoutX.value = paddedX;
      cutoutY.value = paddedY;
      cutoutW.value = paddedWidth;
      cutoutH.value = paddedHeight;
    }
  }, false);

  useEffect(() => {
    frameCallback.setActive(isActiveItem);
  }, [isActiveItem, frameCallback]);

  return <Animated.View ref={animatedRef}>{props.children}</Animated.View>;
};
