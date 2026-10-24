import {
  Caption,
  hexToRgba,
  useIOThemeContext,
  useScaleAnimation,
  WithTestID
} from "@io-app/design-system";
import {
  Canvas,
  ColorMatrix,
  Group,
  ImageSVG,
  Mask,
  OpacityMatrix,
  Paint,
  Rect,
  Circle as SkiaCircle,
  Group as SkiaGroup,
  LinearGradient as SkiaLinearGradient,
  RadialGradient as SkiaRadialGradient,
  useSVG,
  vec
} from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import I18n from "i18next";
import { useState } from "react";
import {
  ColorValue,
  Image,
  LayoutChangeEvent,
  LayoutRectangle,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useDerivedValue,
  useReducedMotion
} from "react-native-reanimated";

import { RotationSensor } from "../../../../components/RotationSensor";
import { useRotationEffectEnabled } from "../../../../hooks/useRotationSensor";
import { useIOSelector } from "../../../../store/hooks";
import { validCredentialStatuses } from "../../common/utils/itwCredentialUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { itwCredentialStatusSelector } from "../../credentials/store/selectors";

type ItwCredentialTrustmarkProps = WithTestID<{
  credential: CredentialMetadata;
  onPress?: () => void;
}>;

/* VISUAL PARAMETERS */

/* Button */
const TRUSTMARK_HEIGHT = 48;
const TRUSTMARK_STAMP_SIZE = TRUSTMARK_HEIGHT * 1.75;
const TRUSTMARK_STAMP_SIZE_RASTER = TRUSTMARK_HEIGHT * 1.5;
const TRUSTMARK_GRADIENT_HEIGHT = TRUSTMARK_STAMP_SIZE * 2;
const buttonBorderRadius = 12;

/* Light */
const lightScaleMultiplier = 1;
const lightSize: LayoutRectangle["width"] = 250;
const visibleLightPercentage = 0.25; // Visible light when it's near box boundaries

export const ItwCredentialTrustmark = ({
  testID,
  credential,
  onPress
}: ItwCredentialTrustmarkProps) => {
  const reduceMotion = useReducedMotion();
  const { themeType } = useIOThemeContext();

  const isLightMode = themeType === "light";

  const { status = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  /* If you want to restore the static variant of the trustmark,
  please set the following variable to false. We force the static
  version to be rendered when `reduceMotion` is enabled. */
  const enableIridescence = !reduceMotion;

  /* Styles */
  const buttonInnerBorderOpacity = isLightMode ? 0.35 : 0.25;
  const buttonInnerBorderColorValue: ColorValue = "#CCCCCC";
  const buttonBackgroundGradientOpacity = isLightMode ? 1 : 0.25;

  const buttonBackgroundGradient = {
    colors: ["#CCCCCC", "#F2F2F2", "#E9E9E9", "#E0E0E0"] as [
      ColorValue,
      ColorValue,
      ...Array<ColorValue>
    ],
    locations: [0, 0.35, 0.7, 1] as [number, number, ...Array<number>],
    // Bottom-to-top gradient, matching the previous 1° angle from react-native-linear-gradient
    start: { x: 0.5, y: 1 },
    end: { x: 0.5, y: 0 }
  };

  const buttonInnerBorderColor: ColorValue = hexToRgba(
    buttonInnerBorderColorValue,
    buttonInnerBorderOpacity
  );

  /* Get button width to set the basic boundaries */
  const [buttonWidth, setButtonWidth] = useState(0);

  const getButtonWidth = (event: LayoutChangeEvent) =>
    setButtonWidth(event.nativeEvent.layout.width);

  const isRotationEffectEnabled = useRotationEffectEnabled();

  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  // Hide trustmark when the credential is not valid
  if (!validCredentialStatuses.includes(status)) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.ctas.trustmark"
      )}
      accessibilityRole="button"
      accessible={true}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={testID}
    >
      <Animated.View
        onLayout={getButtonWidth}
        style={[styles.container, scaleAnimatedStyle]}
      >
        <LinearGradient
          colors={buttonBackgroundGradient.colors}
          end={buttonBackgroundGradient.end}
          locations={buttonBackgroundGradient.locations}
          start={buttonBackgroundGradient.start}
          style={[
            styles.gradientView,
            { opacity: buttonBackgroundGradientOpacity }
          ]}
        />
        <View
          style={[
            styles.buttonInnerBorder,
            { borderColor: buttonInnerBorderColor }
          ]}
        />
        <View style={styles.content}>
          <Caption>
            {I18n.t(
              "features.itWallet.presentation.ctas.trustmark"
            ).toUpperCase()}
          </Caption>
          {!enableIridescence && (
            <Image
              accessibilityIgnoresInvertColors
              source={require("../../../../../img/features/itWallet/credential/trustmark.png")}
              style={{
                ...styles.trustmarkAsset,
                opacity: isLightMode ? 1 : 0.7
              }}
            />
          )}
        </View>
        {enableIridescence && (
          <SkiaIridescentTrustmark
            animated={isRotationEffectEnabled}
            isLightMode={isLightMode}
            width={buttonWidth}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

/* We don't need to look at the whole quaternion range,
just a very small part of it. */
const quaternionRange = 0.1;

type SkiaIridescentTrustmarkProps = {
  animated: boolean;
  isLightMode: boolean;
  width: LayoutRectangle["width"];
};

const SkiaIridescentTrustmark = ({
  animated,
  isLightMode,
  width
}: SkiaIridescentTrustmarkProps) => {
  const trustMarkStampSVG = useSVG(
    /* We use the `html` extension to avoid the `svg-transformer` to render
    local SVG files, as it causes conflicts with the `skia` library.
    To learn more: https://github.com/Shopify/react-native-skia/issues/1335#issuecomment-2088240523 */

    require("../../../../../img/features/itWallet/credential/trustmark-stamp.svg.html")
  );

  return (
    <Canvas
      style={{
        position: "absolute",
        height: TRUSTMARK_HEIGHT,
        width: "100%"
      }}
    >
      <RotationSensor enabled={animated}>
        {roll => (
          <TrustmarkEffects
            isLightMode={isLightMode}
            roll={roll}
            svg={trustMarkStampSVG}
            width={width}
          />
        )}
      </RotationSensor>
    </Canvas>
  );
};

type TrustmarkEffectsProps = {
  isLightMode: boolean;
  roll?: SharedValue<number>;
  svg: ReturnType<typeof useSVG>;
  width: LayoutRectangle["width"];
};

const TrustmarkEffects = ({
  isLightMode,
  roll,
  svg,
  width
}: TrustmarkEffectsProps) => {
  const trustmarkTickOpacity = isLightMode ? 1 : 0.8;
  const lightSkiaOpacity = isLightMode ? 0.7 : 0.25;

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

  const skiaGradientRainbowTranslateY = useDerivedValue(() => [
    {
      translateY: interpolate(
        roll?.value ?? 0,
        [-quaternionRange, quaternionRange],
        [-TRUSTMARK_GRADIENT_HEIGHT + TRUSTMARK_STAMP_SIZE, 0],
        Extrapolation.CLAMP
      )
    }
  ]);

  return (
    <>
      <SkiaGroup
        opacity={lightSkiaOpacity}
        origin={vec(width / 2, TRUSTMARK_HEIGHT / 2)}
      >
        <SkiaCircle
          cx={width / 2}
          cy={TRUSTMARK_HEIGHT / 2}
          r={lightSize / 2}
          transform={skiaLightTranslateX}
        >
          <SkiaRadialGradient
            c={vec(width / 2, TRUSTMARK_HEIGHT / 2)}
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

      <SkiaGroup blendMode={"colorBurn"} opacity={0.05}>
        <TrustmarkRainbowGradient
          transform={skiaGradientRainbowTranslateY}
          width={width}
        />
      </SkiaGroup>

      <Mask
        mask={
          <SkiaGroup blendMode={"colorDodge"} opacity={0.8}>
            <TrustmarkRainbowGradient
              transform={skiaGradientRainbowTranslateY}
              width={width}
            />
          </SkiaGroup>
        }
        mode="alpha"
      >
        <Group
          layer={
            <Paint>
              <ColorMatrix matrix={OpacityMatrix(trustmarkTickOpacity)} />
            </Paint>
          }
        >
          <ImageSVG
            height={TRUSTMARK_STAMP_SIZE}
            svg={svg}
            width={TRUSTMARK_STAMP_SIZE}
            x={width - TRUSTMARK_HEIGHT - 24}
            y={-TRUSTMARK_STAMP_SIZE * 0.18}
          />
        </Group>
      </Mask>
    </>
  );
};

type TrustmarkRainbowGradientProps = {
  transform: SharedValue<Array<{ translateY: number }>>;
  width: LayoutRectangle["width"];
};

const TrustmarkRainbowGradient = ({
  transform,
  width
}: TrustmarkRainbowGradientProps) => (
  <SkiaGroup blendMode={"colorDodge"}>
    <Rect
      height={TRUSTMARK_GRADIENT_HEIGHT}
      transform={transform}
      width={width}
      x={0}
      y={0}
    >
      <SkiaLinearGradient
        colors={[
          "rgba(255, 119, 115,1)",
          "rgba(255, 237, 95, 1)",
          "rgba(168, 255, 95, 1)",
          "rgba(131, 255, 247,1)",
          "rgba(120, 148, 255, 1)",
          "rgba(216, 117, 255, 1)",
          "rgba(255, 119, 115, 1)"
        ]}
        end={vec(0, TRUSTMARK_GRADIENT_HEIGHT)}
        mode="decal"
        positions={[0, 0.2, 0.4, 0.6, 0.8, 0.9, 1]}
        start={vec(0, 0)}
      />
    </Rect>
  </SkiaGroup>
);

const styles = StyleSheet.create({
  container: {
    height: TRUSTMARK_HEIGHT,
    borderCurve: "continuous",
    borderRadius: buttonBorderRadius,
    overflow: "hidden"
  },
  gradientView: {
    ...StyleSheet.absoluteFill
  },
  buttonInnerBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: buttonBorderRadius - 1,
    borderCurve: "continuous",
    borderWidth: 1
  },
  content: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    zIndex: 10,
    paddingHorizontal: 16
  },
  trustmarkAsset: {
    height: TRUSTMARK_STAMP_SIZE_RASTER,
    width: TRUSTMARK_STAMP_SIZE_RASTER,
    position: "absolute",
    top: "-20%",
    right: -8,
    zIndex: 1
  }
});
