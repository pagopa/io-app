/* eslint-disable functional/immutable-data */
import {
  Canvas,
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

export type ItwSkiaBrandedGradientVariant = "default" | "warning" | "error";

type ItwIridescentBorderProps = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
  variant?: ItwSkiaBrandedGradientVariant;
};

/**
 * WARNING: this component must be placed inside a {@link Canvas} component.
 *
 * Renders an animated IT-Wallet branded border using Skia and device rotation sensor data.
 */
export const ItwBrandedSkiaGradient = ({
  width,
  height,
  variant = "default"
}: ItwIridescentBorderProps) => {
  /* Sensors */
  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);

  const currentRoll = useSharedValue(0);
  const initialRoll = useSharedValue(0);

  /* Maps variants to gradient colors */
  const gradientByVariant = {
    default: ITW_BRAND_GRADIENT,
    warning: ITW_BRAND_GRADIENT_WARNING,
    error: ITW_BRAND_GRADIENT_ERROR
  };

  /* Makes gradient slightly bigger to handle animation overflow */
  const gradientX = -width * 0.2;
  const gradientY = -height;
  const gradientWidth = width * 2;
  const gradientHeight = height * 3;

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
   * Not all devices are in an initial flat position on a surface
   * (e.g. a table) then we use a relative rotation value,
   * not an absolute one
   */
  const relativeRoll = useDerivedValue(
    () => initialRoll.value - currentRoll.value
  );

  /**
   * We don't need to look at the whole quaternion range,
   * just a very small part of it.
   */
  const quaternionRange: number = 0.5;

  const skiaGradientTransform = useDerivedValue(() => [
    {
      translateY: interpolate(
        relativeRoll.value,
        [-quaternionRange, quaternionRange],
        [-height, height],
        Extrapolation.CLAMP
      )
    }
  ]);

  return (
    <Rect
      x={0}
      y={gradientY}
      width={gradientWidth}
      height={gradientHeight}
      transform={skiaGradientTransform}
    >
      <SkiaLinearGradient
        mode="mirror"
        start={vec(gradientX, 0)}
        end={vec(width / 3, width)}
        colors={gradientByVariant[variant]}
      />
    </Rect>
  );
};
