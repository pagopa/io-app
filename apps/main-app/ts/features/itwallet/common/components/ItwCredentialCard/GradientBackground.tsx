import {
  LinearGradient,
  RadialGradient,
  Rect,
  vec
} from "@shopify/react-native-skia";
import { memo, useMemo } from "react";

import { CredentialCardConfig } from "./config";

/**
 * Computes the Skia LinearGradient start/end vectors for a given angle
 * (CSS convention: 0° = bottom→top, 90° = left→right) and canvas dimensions.
 * The resulting line passes through the center and is long enough to cover
 * all four corners of the rectangle.
 */
export const getGradientVectors = (
  angle: number,
  width: number,
  height: number
): { end: ReturnType<typeof vec>; start: ReturnType<typeof vec> } => {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const cx = width / 2;
  const cy = height / 2;
  // Minimum half-length that covers every corner when projected on the direction
  const d = Math.abs(cx * dx) + Math.abs(cy * dy);
  return {
    start: vec(cx - dx * d, cy - dy * d),
    end: vec(cx + dx * d, cy + dy * d)
  };
};

type CredentialCardSkiaBackgroundProps = {
  bg: CredentialCardConfig["background"];
  height: number;
  width: number;
};

/**
 * Skia-renderable background layer for a credential card or detail header.
 * Must be rendered inside a Skia <Canvas>.
 * Memoized to avoid re-renders when dimensions and background config are stable.
 */
export const SkiaGradientBackground = memo(
  ({ bg, width, height }: CredentialCardSkiaBackgroundProps) => {
    const { start, end } = useMemo(
      () => getGradientVectors(bg.angle || 0, width, height),
      [bg.angle, width, height]
    );
    return (
      <Rect height={height} width={width} x={0} y={0}>
        {bg.type === "radial" ? (
          <RadialGradient
            c={vec(width * bg.center[0], height * bg.center[1])}
            colors={bg.colors}
            positions={bg.positions}
            r={width * bg.radius}
          />
        ) : (
          <LinearGradient
            colors={bg.colors}
            end={end}
            positions={bg.positions}
            start={start}
          />
        )}
      </Rect>
    );
  }
);
