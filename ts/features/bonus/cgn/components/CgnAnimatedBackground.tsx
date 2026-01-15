import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Path, Group } from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  cancelAnimation
} from "react-native-reanimated";
import { Point, generateRandomSvgMovement } from "../utils/svgBackground";

const BLOB_PATH =
  "M210.82,134c.84-37.64-29.89-86.36-56.21-102.85C126.82,16.47,48.61-10.19,16.2,10.36c-33.63,18,1.38,93.26.29,124.61,1.14,31.26-7.74,78.81,25.85,96.73,32.39,20.51,69.63-11.14,97.39-25.92C166.74,188.88,212.81,173,210.82,134Z";

const BACKGROUND_COLOR = "#f4f5f8";

interface BlobConfig {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
  duration: number;
  minPoint: Point;
  maxPoint: Point;
}

const BLOBS: Array<BlobConfig> = [
  {
    scaleX: -0.8,
    scaleY: 0.8,
    translateX: -200,
    translateY: -100,
    duration: 12000,
    minPoint: { x: 80, y: -100 },
    maxPoint: { x: 100, y: 50 }
  },
  {
    scaleX: 0.8,
    scaleY: 0.8,
    translateX: 250,
    translateY: 80,
    duration: 12000,
    minPoint: { x: -80, y: 0 },
    maxPoint: { x: 100, y: 10 }
  },
  {
    scaleX: 0.7,
    scaleY: 0.7,
    translateX: -50,
    translateY: 50,
    duration: 12000,
    minPoint: { x: -50, y: 50 },
    maxPoint: { x: 50, y: 10 }
  }
];

function AnimatedBlob({
  config,
  translationPoints
}: {
  config: BlobConfig;
  translationPoints: Array<{ x: number; y: number }>;
}) {
  const animationProgress = useSharedValue(0);

  const transform = useDerivedValue(() => {
    if (translationPoints.length === 0) {
      return [
        { scaleX: config.scaleX },
        { scaleY: config.scaleY },
        { translateX: config.translateX },
        { translateY: config.translateY }
      ];
    }

    const inputRange = translationPoints.map(
      (_, i) => i / translationPoints.length
    );
    const xValues = translationPoints.map(p => p.x);
    const yValues = translationPoints.map(p => p.y);

    const posX = interpolate(
      animationProgress.value,
      inputRange,
      xValues,
      Extrapolation.CLAMP
    );

    const posY = interpolate(
      animationProgress.value,
      inputRange,
      yValues,
      Extrapolation.CLAMP
    );

    return [
      { scaleX: config.scaleX },
      { scaleY: config.scaleY },
      { translateX: config.translateX + posX },
      { translateY: config.translateY + posY }
    ];
  });

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    animationProgress.value = withRepeat(
      withTiming(1, {
        duration: config.duration,
        easing: Easing.linear
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(animationProgress);
    };
  }, [animationProgress, config.duration]);

  return (
    <Group transform={transform}>
      <Path path={BLOB_PATH} color="#c8c3dc" opacity={0.6} />
    </Group>
  );
}

export function CgnAnimatedBackground() {
  const MOVEMENT_STEPS = 12;

  const translationA = generateRandomSvgMovement(
    MOVEMENT_STEPS,
    BLOBS[0].minPoint,
    BLOBS[0].maxPoint
  );
  const translationB = generateRandomSvgMovement(
    MOVEMENT_STEPS,
    BLOBS[1].minPoint,
    BLOBS[1].maxPoint
  );
  const translationC = generateRandomSvgMovement(
    MOVEMENT_STEPS,
    BLOBS[2].minPoint,
    BLOBS[2].maxPoint
  );

  const parseTranslations = (translationStr: string) =>
    translationStr
      .split(";")
      .filter(s => s.trim())
      .map(pair => {
        const [x, y] = pair.trim().split(" ").map(Number);
        return { x, y };
      });

  const pointsA = parseTranslations(translationA);
  const pointsB = parseTranslations(translationB);
  const pointsC = parseTranslations(translationC);

  return (
    <Canvas
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: BACKGROUND_COLOR }
      ]}
      pointerEvents="none"
    >
      {BLOBS.map((config, index) => {
        const points = [pointsA, pointsB, pointsC][index];
        return (
          <AnimatedBlob
            key={`blob-${index}`}
            config={config}
            translationPoints={points}
          />
        );
      })}
    </Canvas>
  );
}
