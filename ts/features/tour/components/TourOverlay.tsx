/* eslint-disable functional/immutable-data */
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Defs, Mask, Rect } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useIOSelector } from "../../../store/hooks";
import {
  activeGroupIdSelector,
  activeStepIndexSelector,
  tourItemsForActiveGroupSelector
} from "../store/selectors";
import { TourItemMeasurement } from "../types";
import { useTourContext } from "./TourProvider";
import { TourTooltip } from "./TourTooltip";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const OVERLAY_COLOR = "rgba(0,0,0,0.7)";
const CUTOUT_BORDER_RADIUS = 8;
const CUTOUT_PADDING = 4;
const ANIMATION_DURATION = 300;

export const TourOverlay = () => {
  const { getMeasurement, getConfig } = useTourContext();
  const groupId = useIOSelector(activeGroupIdSelector);
  const stepIndex = useIOSelector(activeStepIndexSelector);
  const items = useIOSelector(tourItemsForActiveGroupSelector);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

  const overlayRef = useRef<View>(null);
  const overlayOffsetRef = useRef({ x: 0, y: 0 });

  const cutoutX = useSharedValue(0);
  const cutoutY = useSharedValue(0);
  const cutoutW = useSharedValue(0);
  const cutoutH = useSharedValue(0);

  const [measurement, setMeasurement] = useState<
    TourItemMeasurement | undefined
  >(undefined);
  const [tooltipConfig, setTooltipConfig] = useState<
    { title: string; description: string } | undefined
  >(undefined);

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

  const measureCurrentStep = useCallback(async () => {
    if (groupId === undefined || items.length === 0) {
      return;
    }
    const currentItem = items[stepIndex];
    if (!currentItem) {
      return;
    }

    const m = await getMeasurement(groupId, currentItem.index);
    if (!m) {
      requestAnimationFrame(() => {
        void measureCurrentStep();
      });
      return;
    }

    const offset = await measureOverlayOffset();

    const padded: TourItemMeasurement = {
      x: m.x - offset.x - CUTOUT_PADDING,
      y: m.y - offset.y - CUTOUT_PADDING,
      width: m.width + CUTOUT_PADDING * 2,
      height: m.height + CUTOUT_PADDING * 2
    };

    setMeasurement(padded);
    setTooltipConfig(getConfig(groupId, currentItem.index));

    cutoutX.value = withTiming(padded.x, { duration: ANIMATION_DURATION });
    cutoutY.value = withTiming(padded.y, { duration: ANIMATION_DURATION });
    cutoutW.value = withTiming(padded.width, {
      duration: ANIMATION_DURATION
    });
    cutoutH.value = withTiming(padded.height, {
      duration: ANIMATION_DURATION
    });
  }, [
    groupId,
    items,
    stepIndex,
    getMeasurement,
    getConfig,
    measureOverlayOffset,
    cutoutX,
    cutoutY,
    cutoutW,
    cutoutH
  ]);

  useEffect(() => {
    void measureCurrentStep();
  }, [measureCurrentStep]);

  const animatedCutoutProps = useAnimatedProps(() => ({
    x: cutoutX.value,
    y: cutoutY.value,
    width: cutoutW.value,
    height: cutoutH.value
  }));

  if (!groupId || items.length === 0) {
    return null;
  }

  return (
    <View ref={overlayRef} style={styles.container} pointerEvents="box-none">
      <View style={styles.overlay} pointerEvents="auto">
        <Svg
          width={screenWidth}
          height={screenHeight}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <Mask id="overlayMask">
              <Rect
                x={0}
                y={0}
                width={screenWidth}
                height={screenHeight}
                fill="white"
              />
              <AnimatedRect
                fill="black"
                rx={CUTOUT_BORDER_RADIUS}
                ry={CUTOUT_BORDER_RADIUS}
                animatedProps={animatedCutoutProps}
              />
            </Mask>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={screenWidth}
            height={screenHeight}
            fill={OVERLAY_COLOR}
            mask="url(#overlayMask)"
          />
        </Svg>
      </View>
      {measurement && tooltipConfig && (
        <TourTooltip
          itemMeasurement={measurement}
          title={tooltipConfig.title}
          description={tooltipConfig.description}
          stepIndex={stepIndex}
          totalSteps={items.length}
        />
      )}
    </View>
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
