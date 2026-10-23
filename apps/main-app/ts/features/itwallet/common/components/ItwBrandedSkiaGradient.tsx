import {
  Rect,
  LinearGradient as SkiaLinearGradient,
  vec
} from "@shopify/react-native-skia";
import { LayoutRectangle } from "react-native";
import {
  Extrapolation,
  interpolate,
  SensorType,
  useAnimatedReaction,
  useAnimatedSensor,
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated";

import {
  ITW_BRAND_GRADIENT,
  ITW_BRAND_GRADIENT_ERROR,
  ITW_BRAND_GRADIENT_WARNING
} from "../utils/theme";

export type ItwSkiaBrandedGradientVariant = "default" | "error" | "warning";

type ItwIridescentBorderProps = {
  height: LayoutRectangle["height"];
  variant?: ItwSkiaBrandedGradientVariant;
  width: LayoutRectangle["width"];
};

/* Maps variants to gradient colors */
export const itwBrandedGradientColors = {
  default: ITW_BRAND_GRADIENT,
  warning: ITW_BRAND_GRADIENT_WARNING,
  error: ITW_BRAND_GRADIENT_ERROR
};

/**
 * We don't need to look at the whole quaternion range, just a very small part
 * of it.
 */
const quaternionRange = 0.5;

/**
 * Returns the animated Skia transform that slides the IT-Wallet branded
 * gradient vertically, within `height`, following the device rotation sensor.
 */
export const useItwBrandedGradientTransform = (
  height: LayoutRectangle["height"]
) => {
  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);

  const currentRoll = useSharedValue(0);
  const initialRoll = useSharedValue(0);

  useAnimatedReaction(
    () => rotationSensor.sensor.value,
    s => {
      if (initialRoll.value === 0) {
        initialRoll.value = s.roll;
      }
      currentRoll.value = s.roll;
    },
    []
  );

  /**
   * Not all devices are in an initial flat position on a surface (e.g. a table)
   * then we use a relative rotation value, not an absolute one
   */
  const relativeRoll = useDerivedValue(
    () => initialRoll.value - currentRoll.value
  );

  return useDerivedValue(() => [
    {
      translateY: interpolate(
        relativeRoll.value,
        [-quaternionRange, quaternionRange],
        [-height, height],
        Extrapolation.CLAMP
      )
    }
  ]);
};

/**
 * WARNING: this component must be placed inside a {@link Canvas} component.
 *
 * Renders an animated IT-Wallet branded border using Skia and device rotation
 * sensor data.
 */
export const ItwBrandedSkiaGradient = ({
  width,
  height,
  variant = "default"
}: ItwIridescentBorderProps) => {
  const skiaGradientTransform = useItwBrandedGradientTransform(height);

  /* Makes gradient slightly bigger to handle animation overflow */
  const gradientY = -height;
  const gradientHeight = height * 3;

  return (
    <Rect
      height={gradientHeight}
      transform={skiaGradientTransform}
      width={width}
      x={0}
      y={gradientY}
    >
      <SkiaLinearGradient
        colors={itwBrandedGradientColors[variant]}
        end={vec(width / 3, width)}
        mode="mirror"
        start={vec(0, 0)}
      />
    </Rect>
  );
};
