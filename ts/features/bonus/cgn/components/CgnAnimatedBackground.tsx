import { useIOThemeContext } from "@pagopa/io-app-design-system";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  Easing,
  cancelAnimation,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import { cgnCardColors } from "../screens/CgnDetailScreen";

// Blob configuration
const NUM_BLOB_POINTS = 7;
const BLOB_BASE_RADIUS = 80;
const WOBBLE_AMPLITUDE = 25; // How much the blob wobbles (±pixels)

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

interface AnimatedBlobProps {
  index: number;
  canvasSize: { value: { width: number; height: number } };
  color: string;
}

/**
 * Generate organic-looking deformation using overlapping sine/cosine waves.
 * Uses prime-number frequency ratios and unique phase offsets per point
 * to create pseudo-random movement that still loops seamlessly.
 * Returns value in range approximately [-1, 1].
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
 * Generate a smooth blob path using sine-based organic deformation.
 * Uses continuous time input for seamless looping animation.
 */
const generateBlobPath = (
  seed: number,
  time: number,
  centerX: number,
  centerY: number,
  scale: number
): ReturnType<typeof Skia.Path.Make> => {
  "worklet";
  const path = Skia.Path.Make();
  const scaledRadius = BLOB_BASE_RADIUS * scale;
  const scaledAmplitude = WOBBLE_AMPLITUDE * scale;

  const points: Array<{ x: number; y: number }> = Array.from(
    { length: NUM_BLOB_POINTS },
    (_, i) => {
      const angle = (i / NUM_BLOB_POINTS) * Math.PI * 2;

      // Each point gets unique wobble based on its index
      const wobble = organicWobble(i, time, seed);

      // Map wobble (-1 to 1) to radius variation
      const radiusOffset = wobble * scaledAmplitude;
      const radius = scaledRadius + radiusOffset;

      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    }
  );

  // Create smooth closed curve using cubic Bezier approximation of Catmull-Rom spline
  if (points.length < 3) {
    return path;
  }

  // Helper to get point with wrapping
  const getPoint = (index: number) =>
    points[(index + points.length) % points.length];

  // Start at the midpoint between last and first point for seamless closure
  const startMid = {
    x: (getPoint(-1).x + getPoint(0).x) / 2,
    y: (getPoint(-1).y + getPoint(0).y) / 2
  };
  path.moveTo(startMid.x, startMid.y);

  // Draw smooth curves through each point
  points.forEach((_, i) => {
    const p1 = getPoint(i);
    const p2 = getPoint(i + 1);

    // Midpoint for smooth curve continuation
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    // Quadratic curve through the control point to the next midpoint
    path.quadTo(p1.x, p1.y, mid2.x, mid2.y);
  });

  path.close();
  return path;
};

const AnimatedBlob = ({ index, canvasSize, color }: AnimatedBlobProps) => {
  // Derive properties from index using interpolation
  // This distributes blobs evenly and creates variety without repetitive config
  const pathOffset = index / NUM_BLOBS; // Evenly distributed around ellipse
  // Interpolate properties directly from blob index (0 to NUM_BLOBS-1)
  const blobIndexRange = [0, NUM_BLOBS - 1] as const;
  const seed = interpolate(index, blobIndexRange, SEED_RANGE);
  const scale = interpolate(index, blobIndexRange, SCALE_RANGE);
  const opacity = interpolate(index, blobIndexRange, OPACITY_RANGE);

  const foregroundColor = Skia.Color(color);

  // Single animation driver: 0 → 1 over one orbit, repeats infinitely
  const orbitProgress = useSharedValue(0);

  // Generate morphing blob path at current orbit position
  const blobPath = useDerivedValue(() => {
    // Get center from canvas size (centered relative to the card)
    const { width, height } = canvasSize.value;
    const ellipseCenterX = width / 2;
    const ellipseCenterY = height / 2;

    // Calculate position on elliptical motion path (radii scale with canvas size)
    const angle = (pathOffset + orbitProgress.value) * Math.PI * 2;
    const motionRadiusX = width * MOTION_PATH_RADIUS_X_RATIO;
    const motionRadiusY = height * MOTION_PATH_RADIUS_Y_RATIO;
    const posX = ellipseCenterX + motionRadiusX * Math.cos(angle);
    const posY = ellipseCenterY + motionRadiusY * Math.sin(angle);

    // morphTime drives the blob shape deformation
    const morphTime = orbitProgress.value * MORPH_SPEED;

    return generateBlobPath(seed, morphTime, posX, posY, scale);
  });

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    orbitProgress.value = withRepeat(
      withTiming(1, {
        duration: ORBIT_DURATION,
        easing: Easing.linear
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(orbitProgress);
    };
  }, [orbitProgress]);

  return <Path path={blobPath} color={foregroundColor} opacity={opacity} />;
};

export const CgnAnimatedBackground = () => {
  // Canvas size is provided via onSize callback and updated on the UI thread
  const canvasSize = useSharedValue({ width: 0, height: 0 });
  const { themeType } = useIOThemeContext();

  const isDark = themeType === "dark";

  const backgroundColor = isDark
    ? cgnCardColors.dark.background
    : cgnCardColors.light.background;
  const foregroundColor = isDark
    ? cgnCardColors.dark.foreground
    : cgnCardColors.light.foreground;

  return (
    <Canvas
      style={[StyleSheet.absoluteFillObject, { backgroundColor }]}
      pointerEvents="none"
      onSize={canvasSize}
    >
      {Array.from({ length: NUM_BLOBS }, (_, index) => (
        <AnimatedBlob
          key={`blob-${index}`}
          color={foregroundColor}
          index={index}
          canvasSize={canvasSize}
        />
      ))}
    </Canvas>
  );
};
