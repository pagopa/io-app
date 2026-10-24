import {
  RoundedRect,
  LinearGradient as SkiaLinearGradient,
  vec
} from "@shopify/react-native-skia";
import { ColorSchemeName, LayoutRectangle } from "react-native";

import {
  itwBrandedGradientColors,
  useItwBrandedGradientTransform
} from "./ItwBrandedSkiaGradient";

export type ItwIridescentBorderVariant = "default" | "error" | "warning";

type ItwIridescentBorderProps = {
  borderRadius?: number;
  height: LayoutRectangle["height"];
  themeType?: ColorSchemeName;
  thickness?: number;
  variant?: ItwIridescentBorderVariant;
  width: LayoutRectangle["width"];
};

/* Opacity of the gradient and of the stroke in dark mode */
const DARK_GRADIENT_OPACITY = 0.8;
const DARK_TICK_OPACITY = 0.8;

/**
 * WARNING: this component must be placed inside a {@link Canvas} component.
 *
 * Renders an animated IT-Wallet branded gradient using Skia and device rotation
 * sensor data.
 *
 * The stroke is painted with the gradient directly. This draws the same pixels
 * as masking the stroke with the gradient, without the offscreen layers the
 * mask needs on every frame.
 */
export const ItwBrandedSkiaBorder = ({
  width,
  height,
  thickness = 3,
  borderRadius = 16,
  variant = "default",
  themeType = "light"
}: ItwIridescentBorderProps) => {
  const gradientTransform = useItwBrandedGradientTransform(height);
  const opacity =
    themeType === "light" ? 1 : DARK_GRADIENT_OPACITY * DARK_TICK_OPACITY;

  return (
    <RoundedRect
      height={height}
      opacity={opacity}
      r={borderRadius}
      strokeJoin={"round"}
      strokeWidth={thickness}
      style={"stroke"}
      width={width}
      x={0}
      y={0}
    >
      <SkiaLinearGradient
        colors={itwBrandedGradientColors[variant]}
        end={vec(width / 3, width)}
        mode="mirror"
        start={vec(0, 0)}
        transform={gradientTransform}
      />
    </RoundedRect>
  );
};
