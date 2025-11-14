/* eslint-disable functional/immutable-data */
import { useIOThemeContext } from "@pagopa/io-app-design-system";
import {
  Canvas,
  ColorMatrix,
  Group,
  Mask,
  OpacityMatrix,
  Paint,
  Rect,
  RoundedRect,
  Circle as SkiaCircle,
  Group as SkiaGroup,
  LinearGradient as SkiaLinearGradient,
  RadialGradient as SkiaRadialGradient,
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
  thickness?: number;
  cornerRadius?: number;
};

/* Light */
const lightScaleMultiplier = 1;
const lightSize: LayoutRectangle["width"] = 250;
const visibleLightPercentage = 0.25; // Visible light when it's near box boundaries

/**
 * Renders a branded iridescent border using Skia and device rotation sensor data
 */
export const ItwBrandedBorder = ({
  width,
  height,
  thickness = 3,
  cornerRadius = 16,
  variant = "default"
}: ItwIridescentBorderProps) => {
  const { themeType } = useIOThemeContext();
  const isLightMode = themeType === "light";

  /* Styles */
  const gradientTickOpacity = isLightMode ? 1 : 0.8;
  const lightSkiaOpacity = isLightMode ? 0.4 : 0.05;
  const gradientBorderOpacity = isLightMode ? 1.0 : 0.5;

  /* Sensors */
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

  /* Set translate boundaries for the main light */
  const maxTranslateX = (width - (lightSize ?? 0) * visibleLightPercentage) / 2;

  /* We don't need to look at the whole quaternion range,
      just a very small part of it. */
  const quaternionRange: number = 0.5;

  const skiaLightTranslateX = useDerivedValue(() => {
    const translateX = interpolate(
      relativeRoll.value,
      [quaternionRange, -quaternionRange],
      [maxTranslateX, -maxTranslateX],
      Extrapolation.CLAMP
    );

    return [{ translateX }, { scale: lightScaleMultiplier }];
  });

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

  const BoxLight = () => (
    <SkiaGroup opacity={lightSkiaOpacity} origin={vec(width / 2, height / 2)}>
      <SkiaCircle
        cx={(width ?? 0) / 2}
        cy={(height ?? 0) / 2}
        r={lightSize / 2}
        transform={skiaLightTranslateX}
      >
        <SkiaRadialGradient
          c={vec((width ?? 0) / 2, (height ?? 0) / 2)}
          r={lightSize / 2}
          /* There are many stops because it's an easing gradient. */
          positions={[
            0, 0.081, 0.155, 0.225, 0.29, 0.353, 0.412, 0.471, 0.529, 0.588,
            0.647, 0.71, 0.775, 0.845, 0.919, 1
          ]}
          colors={[
            "rgba(255,255,255,1)",
            "rgba(255,255,255,0.987)",
            "rgba(255,255,255,0.95)",
            "rgba(255,255,255,0.89)",
            "rgba(255,255,255,0.825)",
            "rgba(255,255,255,0.74)",
            "rgba(255,255,255,0.65)",
            "rgba(255,255,255,0.55)",
            "rgba(255,255,255,0.45)",
            "rgba(255,255,255,0.35)",
            "rgba(255,255,255,0.26)",
            "rgba(255,255,255,0.175)",
            "rgba(255,255,255,0.1)",
            "rgba(255,255,255,0.05)",
            "rgba(255,255,255,0.01)",
            "rgba(255,255,255,0)"
          ]}
        />
      </SkiaCircle>
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
      <BoxLight />

      <SkiaGroup blendMode={"colorBurn"} opacity={0.05}>
        <BrandedGradient />
      </SkiaGroup>

      <Mask
        mode="alpha"
        mask={
          <SkiaGroup blendMode={"colorDodge"} opacity={gradientBorderOpacity}>
            <BrandedGradient />
          </SkiaGroup>
        }
      >
        <Group
          layer={
            <Paint>
              <ColorMatrix matrix={OpacityMatrix(gradientTickOpacity)} />
            </Paint>
          }
        >
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={cornerRadius}
            strokeWidth={thickness}
            strokeJoin={"round"}
            style={"stroke"}
          />
        </Group>
      </Mask>
    </Canvas>
  );
};
