/* eslint-disable functional/immutable-data */
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Canvas,
  Group,
  Paint,
  Rect,
  RoundedRect
} from "@shopify/react-native-skia";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useIOSelector } from "../../../store/hooks";
import {
  activeGroupIdSelector,
  activeStepIndexSelector,
  isTourActiveSelector,
  tourItemsForActiveGroupSelector
} from "../store/selectors";
import { TourItemMeasurement } from "../types";
import { useTourContext } from "./TourProvider";
import { TourTooltip } from "./TourTooltip";

const OVERLAY_COLOR = "rgba(0,0,0,0.5)";
const CUTOUT_BORDER_RADIUS = 8;
const CUTOUT_PADDING = 0;
const ANIMATION_DURATION = 350;
const STEP_EASING = Easing.inOut(Easing.quad);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const SCROLL_SETTLE_MS = 400;
const VISIBLE_MARGIN = 16;

export const TourOverlay = () => {
  const { getMeasurement, getConfig, getScrollRef } = useTourContext();
  const isActive = useIOSelector(isTourActiveSelector);
  const groupId = useIOSelector(activeGroupIdSelector);
  const stepIndex = useIOSelector(activeStepIndexSelector);
  const items = useIOSelector(tourItemsForActiveGroupSelector);

  const overlayRef = useRef<View>(null);
  const overlayOffsetRef = useRef({ x: 0, y: 0 });
  const isFirstMeasurement = useRef(true);
  const measureGeneration = useRef(0);

  // Local visibility state: stays true during fade-out
  const [visible, setVisible] = useState(false);

  const cutoutX = useSharedValue(0);
  const cutoutY = useSharedValue(0);
  const cutoutW = useSharedValue(0);
  const cutoutH = useSharedValue(0);
  const opacity = useSharedValue(0);
  const cutoutOpacity = useSharedValue(1);

  const [measurement, setMeasurement] = useState<
    TourItemMeasurement | undefined
  >(undefined);
  const [tooltipConfig, setTooltipConfig] = useState<
    { title: string; description: string } | undefined
  >(undefined);

  // When tour becomes active, mount the overlay and reset first-measurement flag
  useEffect(() => {
    if (isActive) {
      isFirstMeasurement.current = true;
      setVisible(true);
    }
  }, [isActive]);

  // When tour becomes inactive, fade out then unmount
  useEffect(() => {
    if (!isActive && visible) {
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION }, () => {
        runOnJS(setVisible)(false);
      });
    }
  }, [isActive, visible, opacity]);

  const measureOverlayOffset = useCallback(
    () =>
      new Promise<{ x: number; y: number }>(resolve => {
        if (!overlayRef.current) {
          resolve({ x: 0, y: 0 });
          return;
        }
        overlayRef.current.measureInWindow((x, y) => {
          overlayOffsetRef.current = { x, y };
          resolve({ x, y });
        });
      }),
    []
  );

  const scrollIntoViewIfNeeded = useCallback(
    async (
      gId: string,
      itemIndex: number,
      m: TourItemMeasurement,
      generation: number
    ): Promise<
      | { measurement: TourItemMeasurement; didScroll: boolean; stale: false }
      | { stale: true }
    > => {
      const { height: windowHeight } = Dimensions.get("window");
      const ref = getScrollRef(gId);
      if (!ref) {
        return { measurement: m, didScroll: false, stale: false };
      }

      const isAboveView = m.y + m.height < ref.headerHeight + VISIBLE_MARGIN;
      const isBelowView = m.y > windowHeight - VISIBLE_MARGIN;
      if (!isAboveView && !isBelowView) {
        return { measurement: m, didScroll: false, stale: false };
      }

      // Fade out cutout before scrolling so it doesn't stay
      // visible at the old position while content moves
      if (!isFirstMeasurement.current) {
        await new Promise<void>(resolve => {
          cutoutOpacity.value = withTiming(
            0,
            { duration: ANIMATION_DURATION, easing: STEP_EASING },
            () => runOnJS(resolve)()
          );
        });
        if (measureGeneration.current !== generation) {
          return { stale: true };
        }
      }

      const currentScrollY = ref.scrollY.value as number;
      const desiredWindowY = ref.headerHeight + VISIBLE_MARGIN;
      const scrollTarget = Math.max(0, currentScrollY + (m.y - desiredWindowY));
      ref.scrollViewRef.current?.scrollTo({ y: scrollTarget, animated: true });

      await new Promise<void>(resolve => setTimeout(resolve, SCROLL_SETTLE_MS));
      if (measureGeneration.current !== generation) {
        return { stale: true };
      }

      const updated = await getMeasurement(gId, itemIndex);
      if (measureGeneration.current !== generation) {
        return { stale: true };
      }
      return updated
        ? { measurement: updated, didScroll: true, stale: false }
        : { measurement: m, didScroll: true, stale: false };
    },
    [getScrollRef, getMeasurement, cutoutOpacity]
  );

  const applyCutout = useCallback(
    (
      padded: TourItemMeasurement,
      config: { title: string; description: string } | undefined,
      didScroll: boolean
    ) => {
      if (isFirstMeasurement.current) {
        // First step: position cutout immediately, then fade the overlay in
        isFirstMeasurement.current = false;
        setMeasurement(padded);
        setTooltipConfig(config);
        cutoutX.value = padded.x;
        cutoutY.value = padded.y;
        cutoutW.value = padded.width;
        cutoutH.value = padded.height;
        cutoutOpacity.value = 1;
        opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      } else if (didScroll) {
        // Already faded out before scrolling — reposition and fade in
        cutoutX.value = padded.x;
        cutoutY.value = padded.y;
        cutoutW.value = padded.width;
        cutoutH.value = padded.height;
        setMeasurement(padded);
        setTooltipConfig(config);
        cutoutOpacity.value = withTiming(1, {
          duration: ANIMATION_DURATION,
          easing: STEP_EASING
        });
      } else {
        // Normal step transition: fade out cutout, reposition, then fade back in
        const updateStepUI = () => {
          setMeasurement(padded);
          setTooltipConfig(config);
        };
        cutoutOpacity.value = withTiming(
          0,
          { duration: ANIMATION_DURATION, easing: STEP_EASING },
          () => {
            cutoutX.value = padded.x;
            cutoutY.value = padded.y;
            cutoutW.value = padded.width;
            cutoutH.value = padded.height;
            runOnJS(updateStepUI)();
            cutoutOpacity.value = withTiming(1, {
              duration: ANIMATION_DURATION,
              easing: STEP_EASING
            });
          }
        );
      }
    },
    [cutoutX, cutoutY, cutoutW, cutoutH, cutoutOpacity, opacity]
  );

  const measureCurrentStep = useCallback(async () => {
    if (groupId === undefined || items.length === 0) {
      return;
    }
    const currentItem = items[stepIndex];
    if (!currentItem) {
      return;
    }

    measureGeneration.current += 1;
    const generation = measureGeneration.current;

    const initial = await getMeasurement(groupId, currentItem.index);
    if (measureGeneration.current !== generation) {
      return;
    }
    if (!initial) {
      requestAnimationFrame(() => {
        void measureCurrentStep();
      });
      return;
    }

    const scrollResult = await scrollIntoViewIfNeeded(
      groupId,
      currentItem.index,
      initial,
      generation
    );
    if (scrollResult.stale) {
      return;
    }

    const { measurement: m, didScroll } = scrollResult;

    const offset = await measureOverlayOffset();

    const padded: TourItemMeasurement = {
      x: m.x - offset.x - CUTOUT_PADDING,
      y: m.y - offset.y - CUTOUT_PADDING,
      width: m.width + CUTOUT_PADDING * 2,
      height: m.height + CUTOUT_PADDING * 2
    };

    const config = getConfig(groupId, currentItem.index);
    applyCutout(padded, config, didScroll);
  }, [
    groupId,
    items,
    stepIndex,
    getMeasurement,
    getConfig,
    scrollIntoViewIfNeeded,
    measureOverlayOffset,
    applyCutout
  ]);

  useEffect(() => {
    if (visible) {
      void measureCurrentStep();
    }
  }, [visible, measureCurrentStep]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      ref={overlayRef}
      style={[styles.container, animatedContainerStyle]}
      pointerEvents={isActive ? "auto" : "none"}
    >
      <Canvas style={styles.overlay} pointerEvents="none">
        <Group layer={<Paint />}>
          <Rect
            x={0}
            y={0}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            color={OVERLAY_COLOR}
          />
          <Group blendMode="dstOut" opacity={cutoutOpacity}>
            <RoundedRect
              x={cutoutX}
              y={cutoutY}
              width={cutoutW}
              height={cutoutH}
              r={CUTOUT_BORDER_RADIUS}
              color="black"
            />
          </Group>
        </Group>
      </Canvas>
      {measurement && tooltipConfig && (
        <TourTooltip
          itemMeasurement={measurement}
          title={tooltipConfig.title}
          description={tooltipConfig.description}
          stepIndex={stepIndex}
          totalSteps={items.length}
          opacity={cutoutOpacity}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  }
});
