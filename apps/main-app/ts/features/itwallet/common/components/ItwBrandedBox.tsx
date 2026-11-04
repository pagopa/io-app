import { useIOThemeContext } from "@io-app/design-system";
import {
  Canvas,
  Circle as SkiaCircle,
  Group as SkiaGroup,
  RadialGradient as SkiaRadialGradient,
  vec
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { LayoutRectangle, StyleSheet, View } from "react-native";
import {
  Extrapolation,
  interpolate,
  SharedValue,
  useDerivedValue
} from "react-native-reanimated";

import { RotationSensor } from "../../../../components/RotationSensor";
import { useRotationEffectEnabled } from "../../../../hooks/useRotationSensor";
import { useLayoutSize } from "../hooks/useLayoutSize";
import { useItWalletTheme } from "../utils/theme";
import { ItwBrandedSkiaBorder } from "./ItwBrandedSkiaBorder";
import { ItwSkiaBrandedGradientVariant } from "./ItwBrandedSkiaGradient";

type ItwIridescentBorderProps = {
  backgroundVariant?: "gradient" | "solid";
  borderRadius?: number;
  borderThickness?: number;
  style?: React.ComponentProps<typeof View>["style"];
  variant?: ItwSkiaBrandedGradientVariant;
};

const brandedBoxGradientColors: [string, string, ...Array<string>] = [
  "#FFFFFF",
  "#FBFDFF",
  "#F6FBFF",
  "#F2F9FF"
];

/* Light */
const lightScaleMultiplier = 1;
const lightSize: LayoutRectangle["width"] = 250;
const visibleLightPercentage = 0.25; // Visible light when it's near box boundaries

/** Renders a box with IT-Wallet branded animated border and light effect. */
export const ItwBrandedBox = ({
  borderThickness = 3,
  borderRadius = 16,
  backgroundVariant = "solid",
  variant = "default",
  children,
  style: customStyle
}: PropsWithChildren<ItwIridescentBorderProps>) => {
  const theme = useItWalletTheme();
  const { themeType } = useIOThemeContext();
  const isLightMode = themeType === "light";
  const shouldUseGradientBackground =
    isLightMode && backgroundVariant === "gradient";

  const { size, onLayout } = useLayoutSize();

  /* Styles */
  const lightSkiaOpacity = isLightMode ? 0.4 : 0.05;

  const isRotationEffectEnabled = useRotationEffectEnabled();

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        customStyle,
        {
          borderRadius,
          backgroundColor: theme["banner-background"]
        }
      ]}
    >
      {shouldUseGradientBackground && (
        <LinearGradient
          colors={brandedBoxGradientColors}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Skia Canvas for border and light effect */}
      <Canvas
        style={{
          position: "absolute",
          height: size.height,
          width: size.width
        }}
      >
        <RotationSensor enabled={isRotationEffectEnabled}>
          {roll => (
            <>
              {/* Animated light effect */}
              <SkiaLight
                height={size.height}
                opacity={lightSkiaOpacity}
                roll={roll}
                width={size.width}
              />

              {/* Animated gradient border */}
              <ItwBrandedSkiaBorder
                borderRadius={borderRadius}
                height={size.height}
                roll={roll}
                themeType={themeType}
                thickness={borderThickness}
                variant={variant}
                width={size.width}
              />
            </>
          )}
        </RotationSensor>
      </Canvas>

      {/* Box content */}
      {children}
    </View>
  );
};

type SkiaLightProps = {
  height: LayoutRectangle["height"];
  opacity: number;
  roll?: SharedValue<number>;
  width: LayoutRectangle["width"];
};

/* We don't need to look at the whole quaternion range,
    just a very small part of it. */
const quaternionRange = 0.5;

const SkiaLight = ({ width, height, opacity, roll }: SkiaLightProps) => {
  /* Set translate boundaries for the main light */
  const maxTranslateX = (width - lightSize * visibleLightPercentage) / 2;

  const skiaLightTranslateX = useDerivedValue(() => {
    const translateX = interpolate(
      roll?.value ?? 0,
      [quaternionRange, -quaternionRange],
      [maxTranslateX, -maxTranslateX],
      Extrapolation.CLAMP
    );

    return [{ translateX }, { scale: lightScaleMultiplier }];
  });

  return (
    <SkiaGroup opacity={opacity} origin={vec(width / 2, height / 2)}>
      <SkiaCircle
        cx={width / 2}
        cy={height / 2}
        r={lightSize / 2}
        transform={skiaLightTranslateX}
      >
        <SkiaRadialGradient
          c={vec(width / 2, height / 2)}
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
          /* There are many stops because it's an easing gradient. */
          positions={[
            0, 0.081, 0.155, 0.225, 0.29, 0.353, 0.412, 0.471, 0.529, 0.588,
            0.647, 0.71, 0.775, 0.845, 0.919, 1
          ]}
          r={lightSize / 2}
        />
      </SkiaCircle>
    </SkiaGroup>
  );
};

export const ITW_BRANDED_BOX_PADDING = 16;

const styles = StyleSheet.create({
  container: {
    borderCurve: "continuous",
    padding: ITW_BRANDED_BOX_PADDING,
    gap: 6,
    overflow: "hidden"
  }
});
