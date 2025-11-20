/* eslint-disable functional/immutable-data */
import { useIOThemeContext } from "@pagopa/io-app-design-system";
import {
  Canvas,
  Circle as SkiaCircle,
  Group as SkiaGroup,
  RadialGradient as SkiaRadialGradient,
  vec
} from "@shopify/react-native-skia";
import { PropsWithChildren, useState } from "react";
import {
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View
} from "react-native";
import {
  Extrapolation,
  interpolate,
  SensorType,
  useAnimatedReaction,
  useAnimatedSensor,
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated";
import { useItWalletTheme } from "../utils/theme";
import { ItwBranderSkiaBorder } from "./ItwBrandedSkiaBorder";

export type ItwIridescentBorderVariant = "default" | "warning" | "error";

type ItwIridescentBorderProps = {
  variant?: ItwIridescentBorderVariant;
  borderThickness?: number;
  cornerRadius?: number;
};

/* Light */
const lightScaleMultiplier = 1;
const lightSize: LayoutRectangle["width"] = 250;
const visibleLightPercentage = 0.25; // Visible light when it's near box boundaries

/**
 * Renders a box with IT-Wallet branded animated border and light effect.
 */
export const ItwBrandedBox = ({
  borderThickness = 3,
  cornerRadius = 16,
  variant = "default",
  children
}: PropsWithChildren<ItwIridescentBorderProps>) => {
  const theme = useItWalletTheme();
  const { themeType } = useIOThemeContext();
  const isLightMode = themeType === "light";

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  /* Styles */
  const lightSkiaOpacity = isLightMode ? 0.4 : 0.05;

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
  const maxTranslateX =
    (size.width - (lightSize ?? 0) * visibleLightPercentage) / 2;

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

  const SkiaLight = () => (
    <SkiaGroup
      opacity={lightSkiaOpacity}
      origin={vec(size.width / 2, size.height / 2)}
    >
      <SkiaCircle
        cx={(size.width ?? 0) / 2}
        cy={(size.height ?? 0) / 2}
        r={lightSize / 2}
        transform={skiaLightTranslateX}
      >
        <SkiaRadialGradient
          c={vec((size.width ?? 0) / 2, (size.height ?? 0) / 2)}
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

  const handleOnLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View
      onLayout={handleOnLayout}
      style={[
        styles.container,
        {
          backgroundColor: theme["banner-background"]
        }
      ]}
    >
      {/* Box content */}
      {children}

      {/* Skia Canvas for border and light effect */}
      <Canvas
        style={{
          position: "absolute",
          height: size.height,
          width: size.width
        }}
      >
        {/* Animated light effect */}
        <SkiaLight />

        {/* Animated gradient border */}
        <ItwBrandedSkiaBorder
          width={size.width}
          height={size.height}
          variant={variant}
          thickness={borderThickness}
          cornerRadius={cornerRadius}
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderCurve: "continuous",
    padding: 16,
    gap: 6,
    overflow: "hidden"
  }
});
