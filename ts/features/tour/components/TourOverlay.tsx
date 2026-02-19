/* eslint-disable functional/immutable-data */
/**
 * Guided Tour Overlay — Position Tracking Architecture
 *
 * The cutout and tooltip positions are driven by Reanimated shared values
 * (cutoutX/Y/W/H) that live in TourProvider context. This enables two
 * complementary positioning modes:
 *
 * 1. Step transitions (JS thread): When the user advances to a new step,
 *    TourOverlay performs a one-shot measurement via measureInWindow,
 *    handles scroll-into-view if needed, and animates the cutout to the
 *    new position with fade-out/fade-in transitions.
 *
 * 2. Continuous tracking (UI thread): Between step transitions, the active
 *    GuidedTour component runs a useFrameCallback that calls Reanimated's
 *    measure() on the UI thread every frame. If the target element moves
 *    (e.g. due to an offline banner, keyboard, or orientation change), the
 *    shared values update immediately and the Skia cutout + tooltip follow
 *    at 60fps with zero JS thread involvement.
 *
 * The isTracking shared value coordinates the two modes: it is set to false
 * during step transitions (so the frame callback does not interfere with
 * animations) and set to true once the transition completes.
 *
 * Navigation actions (next/back/skip) are dispatched to Redux only when
 * the animation reaches the point where the tooltip content should update,
 * keeping the displayed step indicator and controls in sync with the
 * visual transition.
 */
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
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  activeGroupIdSelector,
  activeStepIndexSelector,
  isTourActiveSelector,
  tourItemsForActiveGroupSelector
} from "../store/selectors";
import {
  completeTourAction,
  nextTourStepAction,
  prevTourStepAction
} from "../store/actions";
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

/**
 * Synchronous on Fabric via JSI. The callback fires inline,
 * so the return value is available immediately.
 */
const measureInWindow = (view: View): TourItemMeasurement | undefined => {
  const result: { value: TourItemMeasurement | undefined } = {
    value: undefined
  };
  view.measureInWindow((x, y, width, height) => {
    if (width !== 0 || height !== 0) {
      result.value = { x, y, width, height };
    }
  });
  return result.value;
};

export const TourOverlay = () => {
  const {
    getMeasurement,
    getConfig,
    isRegionItem,
    getScrollRef,
    cutoutX,
    cutoutY,
    cutoutW,
    cutoutH,
    isTracking,
    overlayAnimatedRef
  } = useTourContext();
  const dispatch = useIODispatch();
  const isActive = useIOSelector(isTourActiveSelector);
  const groupId = useIOSelector(activeGroupIdSelector);
  const stepIndex = useIOSelector(activeStepIndexSelector);
  const items = useIOSelector(tourItemsForActiveGroupSelector);

  const isFirstMeasurement = useRef(true);
  const measureGeneration = useRef(0);
  /**
   * Tracks the step index we are navigating towards. When the user taps
   * Next/Back quickly, this ref stays ahead of the Redux state so that
   * subsequent taps compute the correct target.
   */
  const pendingStepRef = useRef(stepIndex);

  const [visible, setVisible] = useState(false);
  const [tooltipReady, setTooltipReady] = useState(false);

  const [tooltipConfig, setTooltipConfig] = useState<
    { title: string; description: string } | undefined
  >(undefined);

  const opacity = useSharedValue(0);
  const cutoutOpacity = useSharedValue(1);

  // When tour becomes active, mount the overlay and reset state
  useEffect(() => {
    if (isActive) {
      isFirstMeasurement.current = true;
      isTracking.value = false;
      pendingStepRef.current = 0;
      setVisible(true);
      setTooltipReady(false);
    }
  }, [isActive, isTracking]);

  // When tour becomes inactive, fade out then unmount
  useEffect(() => {
    if (!isActive && visible) {
      isTracking.value = false;
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION }, () => {
        scheduleOnRN(setVisible, false);
      });
    }
  }, [isActive, visible, opacity, isTracking]);

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
            () => scheduleOnRN(resolve)
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

      const updated =
        getMeasurement(gId, itemIndex) ??
        // If the layout hasn't committed yet after the scroll,
        // wait one extra frame and retry before falling back
        // to the stale pre-scroll measurement.
        (await new Promise<TourItemMeasurement | undefined>(resolve => {
          requestAnimationFrame(() => {
            resolve(getMeasurement(gId, itemIndex));
          });
        }));
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
      onCommit: () => void,
      didScroll: boolean
    ) => {
      const updateStep = () => {
        onCommit();
        setTooltipReady(true);
        setTooltipConfig(config);
      };

      const positionCutout = () => {
        cutoutX.value = padded.x;
        cutoutY.value = padded.y;
        cutoutW.value = padded.width;
        cutoutH.value = padded.height;
      };

      if (isFirstMeasurement.current) {
        // First step: position cutout immediately, then fade the overlay in
        isFirstMeasurement.current = false;
        updateStep();
        positionCutout();
        cutoutOpacity.value = 1;
        opacity.value = withTiming(1, { duration: ANIMATION_DURATION }, () => {
          // Enable continuous tracking once the overlay is fully visible
          isTracking.value = true;
        });
      } else if (didScroll) {
        // Already faded out before scrolling — reposition and fade in
        positionCutout();
        updateStep();
        cutoutOpacity.value = withTiming(
          1,
          {
            duration: ANIMATION_DURATION,
            easing: STEP_EASING
          },
          () => {
            isTracking.value = true;
          }
        );
      } else {
        // Normal step transition: fade out cutout, reposition, then fade back in.
        // Cancel any lingering animation on cutoutOpacity from a previous
        // step to ensure the completion callback fires reliably.
        cancelAnimation(cutoutOpacity);
        cutoutOpacity.value = withTiming(
          0,
          { duration: ANIMATION_DURATION, easing: STEP_EASING },
          () => {
            cutoutX.value = padded.x;
            cutoutY.value = padded.y;
            cutoutW.value = padded.width;
            cutoutH.value = padded.height;
            scheduleOnRN(updateStep);
            cutoutOpacity.value = withTiming(
              1,
              {
                duration: ANIMATION_DURATION,
                easing: STEP_EASING
              },
              () => {
                isTracking.value = true;
              }
            );
          }
        );
      }
    },
    [cutoutX, cutoutY, cutoutW, cutoutH, cutoutOpacity, opacity, isTracking]
  );

  /**
   * Measures the target step, handles scroll-into-view, and animates
   * the cutout. The `onCommit` callback fires at the exact point where
   * the tooltip content should update (after fade-out and reposition).
   */
  const navigateToStep = useCallback(
    async (targetIndex: number, onCommit: () => void) => {
      if (groupId === undefined || items.length === 0) {
        return;
      }
      const targetItem = items[targetIndex];
      if (!targetItem) {
        return;
      }

      // Pause continuous tracking during the step transition
      isTracking.value = false;

      measureGeneration.current += 1;
      const generation = measureGeneration.current;

      const initial = getMeasurement(groupId, targetItem.index);
      if (!initial) {
        requestAnimationFrame(() => {
          void navigateToStep(targetIndex, onCommit);
        });
        return;
      }

      // Region-based items (e.g. header) are always visible — skip scrolling
      const isRegion = isRegionItem(groupId, targetItem.index);

      const { m, didScroll } = (await (async () => {
        if (isRegion) {
          return { m: initial, didScroll: false };
        }
        const scrollResult = await scrollIntoViewIfNeeded(
          groupId,
          targetItem.index,
          initial,
          generation
        );
        if (scrollResult.stale) {
          return undefined;
        }
        return {
          m: scrollResult.measurement,
          didScroll: scrollResult.didScroll
        };
      })()) ?? { m: undefined, didScroll: undefined };

      if (!m) {
        return;
      }

      // Measure overlay position to convert page coords → overlay-relative coords
      const overlayNode = overlayAnimatedRef.current;
      const overlayOffset = overlayNode
        ? measureInWindow(overlayNode as unknown as View)
        : undefined;
      const ox = overlayOffset?.x ?? 0;
      const oy = overlayOffset?.y ?? 0;

      const padded: TourItemMeasurement = {
        x: m.x - ox - CUTOUT_PADDING,
        y: m.y - oy - CUTOUT_PADDING,
        width: m.width + CUTOUT_PADDING * 2,
        height: m.height + CUTOUT_PADDING * 2
      };

      const config = getConfig(groupId, targetItem.index);
      applyCutout(padded, config, onCommit, didScroll);
    },
    [
      groupId,
      items,
      getMeasurement,
      getConfig,
      isRegionItem,
      scrollIntoViewIfNeeded,
      applyCutout,
      isTracking,
      overlayAnimatedRef
    ]
  );

  // Initial measurement when the overlay becomes visible
  useEffect(() => {
    if (visible) {
      // First step — no Redux dispatch needed, stepIndex is already 0
      void navigateToStep(stepIndex, () => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleNext = useCallback(() => {
    if (!groupId) {
      return;
    }
    const nextIndex = pendingStepRef.current + 1;
    if (nextIndex >= items.length) {
      setTooltipReady(false);
      dispatch(completeTourAction({ groupId }));
      return;
    }
    pendingStepRef.current = nextIndex;
    void navigateToStep(nextIndex, () => {
      dispatch(nextTourStepAction());
    });
  }, [groupId, items.length, navigateToStep, dispatch]);

  const handleBack = useCallback(() => {
    const prevIndex = pendingStepRef.current - 1;
    if (prevIndex < 0) {
      return;
    }
    pendingStepRef.current = prevIndex;
    void navigateToStep(prevIndex, () => {
      dispatch(prevTourStepAction());
    });
  }, [navigateToStep, dispatch]);

  const handleSkip = useCallback(() => {
    if (groupId) {
      setTooltipReady(false);
      dispatch(completeTourAction({ groupId }));
    }
  }, [dispatch, groupId]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      ref={overlayAnimatedRef}
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
      {tooltipReady && tooltipConfig && (
        <TourTooltip
          cutoutX={cutoutX}
          cutoutY={cutoutY}
          cutoutW={cutoutW}
          cutoutH={cutoutH}
          title={tooltipConfig.title}
          description={tooltipConfig.description}
          stepIndex={stepIndex}
          totalSteps={items.length}
          opacity={cutoutOpacity}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
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
