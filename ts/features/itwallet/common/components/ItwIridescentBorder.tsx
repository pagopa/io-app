/* eslint-disable functional/immutable-data */
import {
  Canvas,
  ColorMatrix,
  Group,
  Mask,
  OpacityMatrix,
  Paint,
  Rect,
  RoundedRect,
  Group as SkiaGroup,
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

export type ItwIridescentBorderVariant = "default" | "warning" | "error";

type ItwIridescentBorderProps = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
  variant?: ItwIridescentBorderVariant;
};

export const ItwIridescentBorder = ({
  width,
  height,
  variant = "default"
}: ItwIridescentBorderProps) => {
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

  /* Not all devices are in an initial flat position on a surface
        (e.g. a table) then we use a relative rotation value,
        not an absolute one  */
  const relativeRoll = useDerivedValue(
    () => initialRoll.value - currentRoll.value
  );

  /* We don't need to look at the whole quaternion range,
      just a very small part of it. */
  const quaternionRange: number = 0.5;

  const skiaGradientTranslateY = useDerivedValue(() => [
    {
      translateY: interpolate(
        relativeRoll.value,
        [-quaternionRange, quaternionRange],
        [-height, height],
        Extrapolation.CLAMP
      )
    }
  ]);

  /* Makes gradient slightly bigger to handle animation overflow */
  const gradientX = -width * 0.3;
  const gradientY = -height;
  const gradientHeight = height * 3;

  const gradientByVariant = {
    default: ITW_BRAND_GRADIENT,
    warning: ITW_BRAND_GRADIENT_WARNING,
    error: ITW_BRAND_GRADIENT_ERROR
  };

  const BrandedGradient = () => (
    <SkiaGroup blendMode={"colorDodge"}>
      <Rect
        x={0}
        y={gradientY}
        width={width}
        height={gradientHeight}
        transform={skiaGradientTranslateY}
      >
        <SkiaLinearGradient
          mode="decal"
          start={vec(gradientX, 0)}
          end={vec(width, width)}
          colors={gradientByVariant[variant]}
          positions={[0, 0.2, 0.4, 0.6, 0.8, 0.9, 1]}
        />
      </Rect>
    </SkiaGroup>
  );

  return (
    <Canvas
      style={{
        position: "absolute",
        height,
        width
      }}
    >
      <SkiaGroup blendMode={"colorBurn"} opacity={0}>
        <BrandedGradient />
      </SkiaGroup>

      <Mask
        mode="alpha"
        mask={
          <SkiaGroup blendMode={"colorDodge"} opacity={1}>
            <BrandedGradient />
          </SkiaGroup>
        }
      >
        <Group
          layer={
            <Paint>
              <ColorMatrix matrix={OpacityMatrix(1)} />
            </Paint>
          }
        >
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={16}
            strokeWidth={3}
            strokeJoin={"round"}
            style={"stroke"}
            color={"red"}
          />
        </Group>
      </Mask>
    </Canvas>
  );
};
