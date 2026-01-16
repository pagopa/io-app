import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation
} from "react-native-reanimated";

const BACKGROUND_COLOR = "#f4f5f8";
const BLOB_COLOR = Skia.Color("#c8c3dc");

// Blob configuration
const NUM_BLOB_POINTS = 6;
const BLOB_BASE_RADIUS = 80;
const NOISE_AMPLITUDE = 18; // How much the blob wobbles (±pixels)

// Shared elliptical motion path parameters (relative to center)
const MOTION_PATH_RADIUS_X = 120;
const MOTION_PATH_RADIUS_Y = 180;

interface AnimatedBlobProps {
  // Starting position offset on the shared elliptical path (0 to 1)
  pathOffset: number;
  // How long to complete one orbit (ms)
  orbitDuration: number;
  // Speed multiplier for blob morphing
  morphSpeed: number;
  // Blob appearance
  scale: number;
  opacity: number;
  // Unique seed for noise variation
  seed: number;
  // Ellipse center
  ellipseCenterX: number;
  ellipseCenterY: number;
}

/**
 * Attempt a simplex-like 2D noise function optimized for worklets.
 * Uses gradient noise with smooth interpolation for organic movement.
 */
function grad(hash: number, x: number, y: number): number {
  "worklet";
  // eslint-disable-next-line no-bitwise
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  // eslint-disable-next-line no-bitwise
  return ((h & 1) !== 0 ? -u : u) + ((h & 2) !== 0 ? -2 * v : 2 * v);
}

function permute(x: number): number {
  "worklet";
  return ((x * 34 + 1) * x) % 289;
}

function simplexNoise2D(x: number, y: number): number {
  "worklet";
  // Skew input space to determine which simplex cell we're in
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = x - X0;
  const y0 = y - Y0;

  // Determine which simplex we're in
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  // Hashed gradient indices
  const ii = ((i % 256) + 256) % 256;
  const jj = ((j % 256) + 256) % 256;

  const gi0 = permute(permute(ii) + jj);
  const gi1 = permute(permute(ii + i1) + jj + j1);
  const gi2 = permute(permute(ii + 1) + jj + 1);

  // Calculate contribution from three corners using pure functions
  const computeCorner = (
    tVal: number,
    gi: number,
    px: number,
    py: number
  ): number => {
    "worklet";
    if (tVal < 0) {
      return 0;
    }
    const tSquared = tVal * tVal;
    return tSquared * tSquared * grad(gi, px, py);
  };

  const t0 = 0.5 - x0 * x0 - y0 * y0;
  const t1 = 0.5 - x1 * x1 - y1 * y1;
  const t2 = 0.5 - x2 * x2 - y2 * y2;

  const n0 = computeCorner(t0, gi0, x0, y0);
  const n1 = computeCorner(t1, gi1, x1, y1);
  const n2 = computeCorner(t2, gi2, x2, y2);

  // Scale to [-1, 1]
  return 70 * (n0 + n1 + n2);
}

/**
 * Generate a smooth blob path using simplex noise for organic deformation.
 * Uses continuous time input for seamless looping animation.
 */
function generateBlobPath(
  seed: number,
  time: number,
  centerX: number,
  centerY: number,
  scale: number
): ReturnType<typeof Skia.Path.Make> {
  "worklet";
  const path = Skia.Path.Make();
  const scaledRadius = BLOB_BASE_RADIUS * scale;
  const scaledAmplitude = NOISE_AMPLITUDE * scale;

  // Generate points using Array.from to avoid mutation
  const points: Array<{ x: number; y: number }> = Array.from(
    { length: NUM_BLOB_POINTS },
    (_, i) => {
      const angle = (i / NUM_BLOB_POINTS) * Math.PI * 2;

      // Each point has unique noise coordinates that evolve over time
      // Using different offsets ensures each point moves independently
      const noiseX = seed * 100 + Math.cos(angle) * 2;
      const noiseY = seed * 100 + Math.sin(angle) * 2;

      // Sample noise at current time position - continuous time for smooth morphing
      const noiseValue = simplexNoise2D(noiseX + time, noiseY + time);

      // Map noise (-1 to 1) to radius variation
      const radiusOffset = noiseValue * scaledAmplitude;
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
}

function AnimatedBlob({
  pathOffset,
  orbitDuration,
  morphSpeed,
  scale,
  opacity,
  seed,
  ellipseCenterX,
  ellipseCenterY
}: AnimatedBlobProps) {
  // Single animation driver for orbit - runs continuously 0 to 1
  const orbitProgress = useSharedValue(0);
  // Separate continuous time for morphing - never resets abruptly
  const morphTime = useSharedValue(0);

  // Generate morphing blob path at current orbit position
  const blobPath = useDerivedValue(() => {
    // Calculate position on elliptical motion path
    // pathOffset staggers the blobs around the ellipse
    const angle = (pathOffset + orbitProgress.value) * Math.PI * 2;
    const posX = ellipseCenterX + MOTION_PATH_RADIUS_X * Math.cos(angle);
    const posY = ellipseCenterY + MOTION_PATH_RADIUS_Y * Math.sin(angle);

    // Use continuous morphTime for seamless blob deformation
    return generateBlobPath(
      seed,
      morphTime.value * morphSpeed,
      posX,
      posY,
      scale
    );
  });

  useEffect(() => {
    // Orbit animation - blobs travel around the shared elliptical path
    // eslint-disable-next-line functional/immutable-data
    orbitProgress.value = withRepeat(
      withTiming(1, {
        duration: orbitDuration,
        easing: Easing.linear
      }),
      -1,
      false
    );

    // Morph animation - continuous time progression for blob shape changes
    // Uses a very long duration so time just keeps incrementing smoothly
    // eslint-disable-next-line functional/immutable-data
    morphTime.value = withRepeat(
      withTiming(1000, {
        duration: 1000000, // ~16 minutes before reset, practically continuous
        easing: Easing.linear
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(orbitProgress);
      cancelAnimation(morphTime);
    };
  }, [orbitProgress, morphTime, orbitDuration]);

  return <Path path={blobPath} color={BLOB_COLOR} opacity={opacity} />;
}

export function CgnAnimatedBackground() {
  const { width, height } = useWindowDimensions();
  const centerX = width / 2;
  const centerY = height / 2;

  // Four blobs distributed around the shared elliptical motion path
  // Each blob has a different starting position (pathOffset) on the ellipse
  const blobConfigs: Array<AnimatedBlobProps> = [
    {
      pathOffset: 0, // Starts at right of ellipse
      orbitDuration: 25000,
      morphSpeed: 0.15,
      scale: 1.3,
      opacity: 0.5,
      seed: 1.0,
      ellipseCenterX: centerX,
      ellipseCenterY: centerY
    },
    {
      pathOffset: 0.25, // Starts at bottom of ellipse
      orbitDuration: 25000,
      morphSpeed: 0.12,
      scale: 1.1,
      opacity: 0.45,
      seed: 2.7,
      ellipseCenterX: centerX,
      ellipseCenterY: centerY
    },
    {
      pathOffset: 0.5, // Starts at left of ellipse
      orbitDuration: 25000,
      morphSpeed: 0.18,
      scale: 0.95,
      opacity: 0.4,
      seed: 4.3,
      ellipseCenterX: centerX,
      ellipseCenterY: centerY
    },
    {
      pathOffset: 0.75, // Starts at top of ellipse
      orbitDuration: 25000,
      morphSpeed: 0.14,
      scale: 1.15,
      opacity: 0.42,
      seed: 6.1,
      ellipseCenterX: centerX,
      ellipseCenterY: centerY
    }
  ];

  return (
    <Canvas
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: BACKGROUND_COLOR }
      ]}
      pointerEvents="none"
    >
      {blobConfigs.map((config, index) => (
        <AnimatedBlob key={`blob-${index}`} {...config} />
      ))}
    </Canvas>
  );
}
