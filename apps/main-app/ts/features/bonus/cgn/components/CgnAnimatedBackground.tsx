import { Canvas, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  cancelAnimation,
  Easing,
  interpolate,
  ReduceMotion,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

import { useFeatureColors } from "../../../../hooks/useFeatureColors";
import { useReduceMotionEnabled } from "../../../../hooks/useReduceMotionEnabled";
import { cgnColors } from "../colors";

// Blob configuration
const NUM_BLOB_POINTS = 7;
const BLOB_BASE_RADIUS = 80;
const WOBBLE_RATIO = 25 / BLOB_BASE_RADIUS;

// Elliptical motion path parameters (as fraction of canvas dimensions)
const MOTION_PATH_RADIUS_X_RATIO = 0.35;
const MOTION_PATH_RADIUS_Y_RATIO = 0.4;

// Animation constants
const NUM_BLOBS = 4;
const ORBIT_DURATION = 30000; // 30 seconds per orbit
const MORPH_SPEED = 1; // 1 wobble cycle per orbit
const SCALE_RANGE = [0.95, 1.5] as const;
const OPACITY_RANGE = [0.4, 0.5] as const;
const SEED_RANGE = [1, 7] as const;

// Keep the two lower shapes behind the searchbar throughout the animation.
// Positions, radii and drift are relative to the header's dimensions.
const HEADER_BLOBS = [
  { centerX: 0.18, centerY: 0.94, radiusX: 0.57, radiusY: 0.72 },
  { centerX: 0.5, centerY: -0.14, radiusX: 0.29, radiusY: 0.51 },
  { centerX: 0.94, centerY: 0.73, radiusX: 0.44, radiusY: 0.66 }
] as const;
const HEADER_DRIFT_X_RATIO = 0.012;
const HEADER_DRIFT_Y_RATIO = 0.018;
const HEADER_WOBBLE_RATIO = 0.07;

interface AnimatedBlobProps {
  anchor?: (typeof HEADER_BLOBS)[number];
  blobCount: number;
  canvasSize: { value: { height: number; width: number } };
  color: string;
  index: number;
  reduceMotion: boolean;
}

/**
 * Generate organic-looking deformation using overlapping sine/cosine waves.
 * Uses prime-number frequency ratios and unique phase offsets per point to
 * create pseudo-random movement that still loops seamlessly. Returns value in
 * range approximately [-1, 1].
 */
const organicWobble = (
  pointIndex: number,
  time: number,
  seed: number
): number => {
  "worklet";
  const TWO_PI = Math.PI * 2;
  // Unique phase offset for each point (based on golden ratio for good distribution)
  const goldenAngle = 2.399963; // ~137.5 degrees in radians
  const pointPhase = pointIndex * goldenAngle + seed;

  // Layer multiple waves with prime-number time multipliers for complexity
  // Using both sin and cos creates more varied movement patterns
  const wave1 = Math.sin(time * TWO_PI + pointPhase);
  const wave2 = Math.cos(time * TWO_PI * 2 + pointPhase * 1.7) * 0.6;
  const wave3 = Math.sin(time * TWO_PI * 3 + pointPhase * 2.3) * 0.3;
  const wave4 = Math.cos(time * TWO_PI * 5 + pointPhase * 3.1) * 0.15;

  // Normalize (max sum ≈ 2.05)
  return (wave1 + wave2 + wave3 + wave4) / 2.05;
};

/**
 * Generate a smooth blob path using sine-based organic deformation. Uses
 * continuous time input for seamless looping animation.
 */
const generateBlobPath = (
  seed: number,
  time: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  wobbleRatio: number
): SkPath => {
  "worklet";
  const builder = Skia.PathBuilder.Make();

  const points: Array<{ x: number; y: number }> = Array.from(
    { length: NUM_BLOB_POINTS },
    (_, i) => {
      const angle = (i / NUM_BLOB_POINTS) * Math.PI * 2;

      // Each point gets unique wobble based on its index
      const radiusFactor = 1 + organicWobble(i, time, seed) * wobbleRatio;

      return {
        x: centerX + radiusX * radiusFactor * Math.cos(angle),
        y: centerY + radiusY * radiusFactor * Math.sin(angle)
      };
    }
  );

  // Create smooth closed curve using cubic Bezier approximation of Catmull-Rom spline
  if (points.length < 3) {
    return builder.detach();
  }

  // Helper to get point with wrapping
  const getPoint = (index: number) =>
    points[(index + points.length) % points.length];

  // Start at the midpoint between last and first point for seamless closure
  const startMid = {
    x: (getPoint(-1).x + getPoint(0).x) / 2,
    y: (getPoint(-1).y + getPoint(0).y) / 2
  };
  builder.moveTo(startMid.x, startMid.y);

  // Draw smooth curves through each point
  points.forEach((_, i) => {
    const p1 = getPoint(i);
    const p2 = getPoint(i + 1);

    // Midpoint for smooth curve continuation
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    // Quadratic curve through the control point to the next midpoint
    builder.quadTo(p1.x, p1.y, mid2.x, mid2.y);
  });

  builder.close();
  return builder.detach();
};

const AnimatedBlob = ({
  anchor,
  blobCount,
  index,
  canvasSize,
  color,
  reduceMotion
}: AnimatedBlobProps) => {
  // Derive properties from index using interpolation
  // This distributes blobs evenly and creates variety without repetitive config
  const pathOffset = index / blobCount;
  const blobIndexRange = [0, blobCount - 1] as const;
  const seed = interpolate(index, blobIndexRange, SEED_RANGE);
  const scale = interpolate(index, blobIndexRange, SCALE_RANGE);
  const opacity = interpolate(index, blobIndexRange, OPACITY_RANGE);

  const foregroundColor = Skia.Color(color);

  // Single animation driver: 0 → 1 over one orbit, repeats infinitely
  const orbitProgress = useSharedValue(0);

  // Generate morphing blob path at current orbit position
  const blobPath = useDerivedValue(() => {
    const { width, height } = canvasSize.value;
    const ellipseCenterX = width * (anchor?.centerX ?? 0.5);
    const ellipseCenterY = height * (anchor?.centerY ?? 0.5);

    // Calculate position on elliptical motion path (radii scale with canvas size)
    const angle = (pathOffset + orbitProgress.value) * Math.PI * 2;
    const motionRadiusX =
      width * (anchor ? HEADER_DRIFT_X_RATIO : MOTION_PATH_RADIUS_X_RATIO);
    const motionRadiusY =
      height * (anchor ? HEADER_DRIFT_Y_RATIO : MOTION_PATH_RADIUS_Y_RATIO);
    const posX = ellipseCenterX + motionRadiusX * Math.cos(angle);
    const posY = ellipseCenterY + motionRadiusY * Math.sin(angle);

    // morphTime drives the blob shape deformation
    const morphTime = orbitProgress.value * MORPH_SPEED;

    const radius = BLOB_BASE_RADIUS * scale;
    return generateBlobPath(
      seed,
      morphTime,
      posX,
      posY,
      anchor ? width * anchor.radiusX : radius,
      anchor ? height * anchor.radiusY : radius,
      anchor ? HEADER_WOBBLE_RATIO : WOBBLE_RATIO
    );
  });

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    // The live system preference above owns playback, not Reanimated's startup setting.
    orbitProgress.value = 0;
    orbitProgress.value = withRepeat(
      withTiming(1, {
        duration: ORBIT_DURATION,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.Never
      }),
      -1,
      false,
      undefined,
      ReduceMotion.Never
    );

    return () => {
      cancelAnimation(orbitProgress);
    };
  }, [orbitProgress, reduceMotion]);

  return <Path color={foregroundColor} opacity={opacity} path={blobPath} />;
};

export const CgnAnimatedBackground = ({
  variant = "card"
}: {
  variant?: "card" | "discovery";
}) => {
  const canvasSize = useSharedValue({ width: 0, height: 0 });
  const colors = useFeatureColors(cgnColors);
  const reduceMotion = useReduceMotionEnabled();

  const backgroundColor = colors.detailCard.background;
  const foregroundColor = colors.detailCard.foreground;
  const anchors = variant === "discovery" ? HEADER_BLOBS : undefined;
  const blobCount = anchors?.length ?? NUM_BLOBS;

  return (
    <View
      onLayout={({ nativeEvent: { layout } }) => {
        canvasSize.value = { width: layout.width, height: layout.height };
      }}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor }]}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        {Array.from({ length: blobCount }, (_, index) => (
          <AnimatedBlob
            anchor={anchors?.[index]}
            blobCount={blobCount}
            canvasSize={canvasSize}
            color={foregroundColor}
            index={index}
            key={`blob-${index}`}
            reduceMotion={reduceMotion}
          />
        ))}
      </Canvas>
    </View>
  );
};
