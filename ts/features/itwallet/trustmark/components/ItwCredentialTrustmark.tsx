/* eslint-disable functional/immutable-data */
import {
  Caption,
  hexToRgba,
  useIOThemeContext,
  useScaleAnimation,
  WithTestID
} from "@pagopa/io-app-design-system";
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
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  SensorType,
  useAnimatedReaction,
  useAnimatedSensor,
  useDerivedValue,
  useReducedMotion,
  useSharedValue
} from "react-native-reanimated";
import { useIOSelector } from "../../../../store/hooks";
import { validCredentialStatuses } from "../../common/utils/itwCredentialUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { itwCredentialStatusSelector } from "../../credentials/store/selectors";

type ItwCredentialTrustmarkProps = WithTestID<{
  credential: CredentialMetadata;
  onPress?: () => void;
}>;

type ButtonSize = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
};

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
  const trustmarkTickOpacity = isLightMode ? 1 : 0.8;
  const lightSkiaOpacity = isLightMode ? 0.7 : 0.25;
  const buttonInnerBorderOpacity = isLightMode ? 0.35 : 0.25;
  const buttonInnerBorderColorValue: ColorValue = "#CCCCCC";
  const buttonBackgroundGradientOpacity = isLightMode ? 1 : 0.25;

  const buttonBackgroundGradient = {
    colors: ["#CCCCCC", "#F2F2F2", "#E9E9E9", "#E0E0E0"],
    locations: [0, 0.35, 0.7, 1],
    center: { x: 0.5, y: 0.7 }
  };

  const buttonInnerBorderColor: ColorValue = hexToRgba(
    buttonInnerBorderColorValue,
    buttonInnerBorderOpacity
  );

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

  /* Get button size to set the basic boundaries */
  const [buttonSize, setButtonSize] = useState<ButtonSize>();

  const getButtonSize = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setButtonSize({ width, height });
  };

  /* Set translate boundaries for the main light */
  const maxTranslateX =
    ((buttonSize?.width ?? 0) - (lightSize ?? 0) * visibleLightPercentage) / 2;

  /* We don't need to look at the whole quaternion range,
  just a very small part of it. */
  const quaternionRange: number = 0.1;

  const skiaLightTranslateX = useDerivedValue(() => {
    const translateX = interpolate(
      relativeRoll.value,
      [quaternionRange, -quaternionRange],
      [maxTranslateX, -maxTranslateX],
      Extrapolation.CLAMP
    );

    return [{ translateX }, { scale: lightScaleMultiplier }];
  });

  const skiaGradientRainbowTranslateY = useDerivedValue(() => [
    {
      translateY: interpolate(
        relativeRoll.value,
        [-quaternionRange, quaternionRange],
        [-TRUSTMARK_GRADIENT_HEIGHT + TRUSTMARK_STAMP_SIZE, 0],
        Extrapolation.CLAMP
      )
    }
  ]);

  const ButtonLight = () => (
    <SkiaGroup
      opacity={lightSkiaOpacity}
      origin={vec((buttonSize?.width ?? 0) / 2, (buttonSize?.height ?? 0) / 2)}
    >
      <SkiaCircle
        cx={(buttonSize?.width ?? 0) / 2}
        cy={(buttonSize?.height ?? 0) / 2}
        r={lightSize / 2}
        transform={skiaLightTranslateX}
      >
        <SkiaRadialGradient
          c={vec((buttonSize?.width ?? 0) / 2, (buttonSize?.height ?? 0) / 2)}
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

  const TrustmarkRainbowGradient = () => (
    <SkiaGroup blendMode={"colorDodge"}>
      <Rect
        x={0}
        y={0}
        width={buttonSize?.width ?? 0}
        height={TRUSTMARK_GRADIENT_HEIGHT}
        transform={skiaGradientRainbowTranslateY}
      >
        <SkiaLinearGradient
          mode="decal"
          start={vec(0, 0)}
          end={vec(0, TRUSTMARK_GRADIENT_HEIGHT)}
          colors={[
            "rgba(255, 119, 115,1)",
            "rgba(255, 237, 95, 1)",
            "rgba(168, 255, 95, 1)",
            "rgba(131, 255, 247,1)",
            "rgba(120, 148, 255, 1)",
            "rgba(216, 117, 255, 1)",
            "rgba(255, 119, 115, 1)"
          ]}
          positions={[0, 0.2, 0.4, 0.6, 0.8, 0.9, 1]}
        />
      </Rect>
    </SkiaGroup>
  );

  const trustMarkStampSVG = useSVG(
    /* We use the `html` extension to avoid the `svg-transformer` to render
    local SVG files, as it causes conflicts with the `skia` library.
    To learn more: https://github.com/Shopify/react-native-skia/issues/1335#issuecomment-2088240523 */
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../../../../img/features/itWallet/credential/trustmark-stamp.svg.html")
  );

  const SkiaIridescentTrustmark = () => (
    <Canvas
      style={{
        position: "absolute",
        height: TRUSTMARK_HEIGHT,
        width: "100%"
      }}
    >
      <ButtonLight />

      <SkiaGroup blendMode={"colorBurn"} opacity={0.05}>
        <TrustmarkRainbowGradient />
      </SkiaGroup>

      <Mask
        mode="alpha"
        mask={
          <SkiaGroup blendMode={"colorDodge"} opacity={0.8}>
            <TrustmarkRainbowGradient />
          </SkiaGroup>
        }
      >
        <Group
          layer={
            <Paint>
              <ColorMatrix matrix={OpacityMatrix(trustmarkTickOpacity)} />
            </Paint>
          }
        >
          <ImageSVG
            svg={trustMarkStampSVG}
            x={(buttonSize?.width ?? 0) - TRUSTMARK_HEIGHT - 24}
            y={-TRUSTMARK_STAMP_SIZE * 0.18}
            width={TRUSTMARK_STAMP_SIZE}
            height={TRUSTMARK_STAMP_SIZE}
          />
        </Group>
      </Mask>
    </Canvas>
  );

  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  // Hide trustmark when the credential is not valid
  if (!validCredentialStatuses.includes(status)) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessible={true}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.ctas.trustmark"
      )}
      accessibilityRole="button"
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
    >
      <Animated.View
        style={[styles.container, scaleAnimatedStyle]}
        onLayout={getButtonSize}
      >
        <LinearGradient
          useAngle
          angle={1}
          angleCenter={buttonBackgroundGradient.center}
          locations={buttonBackgroundGradient.locations}
          colors={buttonBackgroundGradient.colors}
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
              style={{
                ...styles.trustmarkAsset,
                opacity: isLightMode ? 1 : 0.7
              }}
              source={require("../../../../../img/features/itWallet/credential/trustmark.png")}
              accessibilityIgnoresInvertColors
            />
          )}
        </View>
        {enableIridescence && <SkiaIridescentTrustmark />}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: TRUSTMARK_HEIGHT,
    borderCurve: "continuous",
    borderRadius: buttonBorderRadius,
    overflow: "hidden"
  },
  gradientView: {
    ...StyleSheet.absoluteFillObject
  },
  buttonInnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: buttonBorderRadius - 1,
    borderCurve: "continuous",
    borderWidth: 1
  },
  content: {
    ...StyleSheet.absoluteFillObject,
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
