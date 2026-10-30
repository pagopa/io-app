import {
  LinearGradient as SkiaLinearGradient,
  vec
} from "@shopify/react-native-skia";
import { LayoutRectangle } from "react-native";
import {
  Extrapolation,
  interpolate,
  SharedValue,
  useDerivedValue
} from "react-native-reanimated";

import {
  ITW_BRAND_GRADIENT,
  ITW_BRAND_GRADIENT_ERROR,
  ITW_BRAND_GRADIENT_WARNING
} from "../utils/theme";

export type ItwSkiaBrandedGradientVariant = "default" | "error" | "warning";

type ItwBrandedSkiaGradientProps = {
  height: LayoutRectangle["height"];
  /** Relative device roll; the gradient stays at rest when omitted. */
  roll?: SharedValue<number>;
  variant?: ItwSkiaBrandedGradientVariant;
  width: LayoutRectangle["width"];
};

const gradientByVariant = {
  default: ITW_BRAND_GRADIENT,
  warning: ITW_BRAND_GRADIENT_WARNING,
  error: ITW_BRAND_GRADIENT_ERROR
};

/** Roll range (radians) mapped to the whole gradient movement. */
const ROLL_RANGE = 0.5;

/**
 * WARNING: this component must be the child of a Skia drawing (e.g. `Rect`).
 *
 * Shades its parent with the IT-Wallet branded gradient, which slides
 * vertically with the device roll.
 */
export const ItwBrandedSkiaGradient = ({
  width,
  height,
  variant = "default",
  roll
}: ItwBrandedSkiaGradientProps) => {
  const transform = useDerivedValue(() => [
    {
      translateY: interpolate(
        roll?.value ?? 0,
        [-ROLL_RANGE, ROLL_RANGE],
        [-height, height],
        Extrapolation.CLAMP
      )
    }
  ]);

  return (
    <SkiaLinearGradient
      colors={gradientByVariant[variant]}
      end={vec(width / 3, width)}
      mode="mirror"
      start={vec(0, 0)}
      transform={transform}
    />
  );
};
