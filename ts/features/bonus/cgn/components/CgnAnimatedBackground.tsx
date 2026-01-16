import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  interpolate
} from "react-native-reanimated";

const BACKGROUND_COLOR = "#f4f5f8";
const BLOB_COLOR = Skia.Color("#c8c3dc");

// Blob configuration
const NUM_BLOB_POINTS = 6;
const BLOB_BASE_RADIUS = 80;
const NOISE_AMPLITUDE = 18; // How much the blob wobbles (±pixels)

// Elliptical motion path parameters (as fraction of canvas dimensions)
const MOTION_PATH_RADIUS_X_RATIO = 0.35;
const MOTION_PATH_RADIUS_Y_RATIO = 0.4;

// Animation constants
const NUM_BLOBS = 3;
const ORBIT_DURATION = 30000; // 30 seconds per orbit
const MORPH_SPEED = 1; // 1 wobble cycle per orbit
const SCALE_RANGE = [0.95, 1.5] as const;
const OPACITY_RANGE = [0.4, 0.5] as const;
const SEED_RANGE = [1.0, 7.0] as const;

interface AnimatedBlobProps {
  // Index of this blob (0 to NUM_BLOBS-1), used to derive other properties
  index: number;
  // Canvas size shared value (updated by onSize callback)
  canvasSize: { value: { width: number; height: number } };
}

// Pre-computed constants for simplex noise (computed once, not per frame)
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/**
 * Hash function for gradient selection.
 * Uses modulo arithmetic instead of bitwise ops where possible.
 */
function gradDot(hash: number, x: number, y: number): number {
  "worklet";
  // eslint-disable-next-line no-bitwise
  const h = hash & 7;
  // 8 unit gradient vectors pointing in different directions.
  // Simplex noise works by computing dot products between these gradients
  // and the vector from each simplex corner to the input point.
  // This creates smooth, continuous pseudo-random values.
  const gradients = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];
  const g = gradients[h];
  return g[0] * x + g[1] * y;
}

/**
 * Permutation function for pseudo-random gradient selection.
 */
function permute(x: number): number {
  "worklet";
  return ((x * 34 + 1) * x) % 289;
}

/**
 * Simplex noise 2D - optimized for worklets.
 * Returns value in range [-1, 1].
 */
function simplexNoise2D(x: number, y: number): number {
  "worklet";
  // Skew input space
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  // Unskew back
  const t = (i + j) * G2;
  const x0 = x - (i - t);
  const y0 = y - (j - t);

  // Simplex corner offsets
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = 1 - i1;

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  // Hash coordinates
  const ii = ((i % 289) + 289) % 289;
  const jj = ((j % 289) + 289) % 289;

  const gi0 = permute(permute(ii) + jj);
  const gi1 = permute(permute(ii + i1) + jj + j1);
  const gi2 = permute(permute(ii + 1) + jj + 1);

  // Corner contributions
  const t0 = Math.max(0, 0.5 - x0 * x0 - y0 * y0);
  const t1 = Math.max(0, 0.5 - x1 * x1 - y1 * y1);
  const t2 = Math.max(0, 0.5 - x2 * x2 - y2 * y2);

  const n0 = t0 * t0 * t0 * t0 * gradDot(gi0, x0, y0);
  const n1 = t1 * t1 * t1 * t1 * gradDot(gi1, x1, y1);
  const n2 = t2 * t2 * t2 * t2 * gradDot(gi2, x2, y2);

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
  // For seamless looping: we sample noise on a circle in noise-space.
  // As 'time' goes 0→1, we trace a circle, ending where we started.
  const timeAngle = time * Math.PI * 2;
  const noiseRadius = 2; // How far to travel in noise space (smaller = smoother)

  const points: Array<{ x: number; y: number }> = Array.from(
    { length: NUM_BLOB_POINTS },
    (_, i) => {
      const angle = (i / NUM_BLOB_POINTS) * Math.PI * 2;

      // Each point samples noise at a unique location that moves in a circle over time
      // seed offsets ensure each blob has different patterns
      // The circular path in noise space (cos/sin of timeAngle) ensures seamless looping
      // Each point has its own phase offset (angle) to create independent movement
      const pointPhase = angle; // Use the point's position as its phase offset
      const noiseX = seed * 50 + Math.cos(timeAngle + pointPhase) * noiseRadius;
      const noiseY = seed * 50 + Math.sin(timeAngle + pointPhase) * noiseRadius;

      const noiseValue = simplexNoise2D(noiseX, noiseY);

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

function AnimatedBlob({ index, canvasSize }: AnimatedBlobProps) {
  // Derive properties from index using interpolation
  // This distributes blobs evenly and creates variety without repetitive config
  const normalizedIndex = index / (NUM_BLOBS - 1); // 0 to 1
  const pathOffset = index / NUM_BLOBS; // Evenly distributed around ellipse
  const seed = interpolate(normalizedIndex, [0, 1], SEED_RANGE);
  const scale = interpolate(normalizedIndex, [0, 1], SCALE_RANGE);
  const opacity = interpolate(normalizedIndex, [0, 1], OPACITY_RANGE);

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

  return <Path path={blobPath} color={BLOB_COLOR} opacity={opacity} />;
}

export function CgnAnimatedBackground() {
  // Canvas size is provided via onSize callback and updated on the UI thread
  const canvasSize = useSharedValue({ width: 0, height: 0 });

  // Generate blob indices array once
  const blobIndices = Array.from({ length: NUM_BLOBS }, (_, i) => i);

  return (
    <Canvas
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: BACKGROUND_COLOR }
      ]}
      pointerEvents="none"
      onSize={canvasSize}
    >
      {blobIndices.map(index => (
        <AnimatedBlob
          key={`blob-${index}`}
          index={index}
          canvasSize={canvasSize}
        />
      ))}
    </Canvas>
  );
}
