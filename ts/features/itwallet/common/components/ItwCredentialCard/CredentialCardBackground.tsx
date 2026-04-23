import { LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { CardBackgroundConfig } from "./credentialCardConfig";

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
): { start: ReturnType<typeof vec>; end: ReturnType<typeof vec> } => {
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
  bg: CardBackgroundConfig;
  width: number;
  height: number;
};

/**
 * Skia-renderable background layer for a credential card or detail header.
 * Must be rendered inside a Skia <Canvas>.
 */
export const CredentialCardSkiaBackground = ({
  bg,
  width,
  height
}: CredentialCardSkiaBackgroundProps) => {
  if (bg.type === "solid") {
    return <Rect x={0} y={0} width={width} height={height} color={bg.color} />;
  }

  const { start, end } = getGradientVectors(bg.angle, width, height);
  return (
    <Rect x={0} y={0} width={width} height={height}>
      <LinearGradient
        start={start}
        end={end}
        colors={bg.colors}
        positions={bg.positions}
      />
    </Rect>
  );
};
