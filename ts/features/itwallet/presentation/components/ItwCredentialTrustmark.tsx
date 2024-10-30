/* eslint-disable functional/immutable-data */
import {
  Body,
  Caption,
  FeatureInfo,
  H6,
  hexToRgba,
  useIOExperimentalDesign,
  VSpacer,
  VStack,
  WithTestID
} from "@pagopa/io-app-design-system";
import {
  Canvas,
  ImageSVG,
  Mask,
  Rect,
  Circle as SkiaCircle,
  Group as SkiaGroup,
  LinearGradient as SkiaLinearGradient,
  RadialGradient as SkiaRadialGradient,
  useSVG,
  vec
} from "@shopify/react-native-skia";
import { default as React, useState } from "react";
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
  useSharedValue
} from "react-native-reanimated";
import { useSpringPressScaleAnimation } from "../../../../components/ui/utils/hooks/useSpringPressScaleAnimation";
import I18n from "../../../../i18n";
// import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { itwEaaVerifierBaseUrl } from "../../../../config";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import {
  CREDENTIALS_MAP,
  trackWalletCredentialShowTrustmark
} from "../../analytics";
import { getCredentialStatus } from "../../common/utils/itwClaimsUtils";
import {
  generateTrustmarkUrl,
  getCredentialNameFromType
} from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type ItwCredentialTrustmarkProps = WithTestID<{
  credential: StoredCredential;
}>;

type ButtonSize = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
};

const trustmarkEnabledCredentials = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
];

const shouldDisplayTrustmark = (credential: StoredCredential) =>
  trustmarkEnabledCredentials.includes(
    credential.credentialType as CredentialType
  ) && getCredentialStatus(credential) !== "expired";

/* VISUAL PARAMETERS */

/* Button */
const TRUSTMARK_HEIGHT = 48;
const TRUSTMARK_STAMP_SIZE = TRUSTMARK_HEIGHT * 1.75;
const TRUSTMARK_STAMP_SIZE_RASTER = TRUSTMARK_HEIGHT * 1.5;
const TRUSTMARK_GRADIENT_HEIGHT = TRUSTMARK_STAMP_SIZE * 2;
const buttonBorderRadius = 12;
const buttonInnerBorderColor: ColorValue = "#CCCCCC";
const buttonBackgroundGradient = {
  colors: ["#CCCCCC", "#F2F2F2", "#E9E9E9", "#E0E0E0"],
  locations: [0, 0.35, 0.7, 1],
  center: { x: 0.5, y: 0.7 }
};

/* Light */
const lightScaleMultiplier = 1;
const lightSkiaOpacity = 0.7;
const lightSize: LayoutRectangle["width"] = 250;
const visibleLightPercentage = 0.25; // Visible light when it's near box boundaries

export const ItwCredentialTrustmark = ({
  testID,
  credential
}: ItwCredentialTrustmarkProps) => {
  /* Bottom sheet for the QR code */
  const trustmarkBottomSheet = useIOBottomSheetAutoresizableModal({
    title: I18n.t("features.itWallet.presentation.trustmark.title"),
    component: <QrCodeBottomSheetContent credential={credential} />
  });

  /* Enable the effect only when the experimental DS is enabled */
  const { isExperimental: enableIridescence } = useIOExperimentalDesign();

  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);
  const currentRoll = useSharedValue(0);
  const { roll: initialRoll } = rotationSensor.sensor.value;

  useAnimatedReaction(
    () => rotationSensor.sensor.value,
    s => (currentRoll.value = s.roll),
    []
  );

  /* Not all devices are in an initial flat position on a surface
    (e.g. a table) then we use a relative rotation value,
    not an absolute one  */
  const relativeRoll = useDerivedValue(() => initialRoll - currentRoll.value);

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
        <ImageSVG
          svg={trustMarkStampSVG}
          x={(buttonSize?.width ?? 0) - TRUSTMARK_HEIGHT - 24}
          y={-TRUSTMARK_STAMP_SIZE * 0.18}
          width={TRUSTMARK_STAMP_SIZE}
          height={TRUSTMARK_STAMP_SIZE}
        />
      </Mask>
    </Canvas>
  );

  const { onPressIn, onPressOut, animatedScaleStyle } =
    useSpringPressScaleAnimation();

  if (!shouldDisplayTrustmark(credential)) {
    return null;
  }

  const onPressWithTrackEvent = () => {
    trackWalletCredentialShowTrustmark(
      CREDENTIALS_MAP[credential.credentialType]
    );
    trustmarkBottomSheet.present();
  };

  return (
    <>
      <Pressable
        onPress={onPressWithTrackEvent}
        testID={testID}
        accessible={true}
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.trustmark.cta"
        )}
        accessibilityRole="button"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onTouchEnd={onPressOut}
      >
        <Animated.View
          style={[styles.container, animatedScaleStyle]}
          onLayout={getButtonSize}
        >
          <LinearGradient
            useAngle
            angle={1}
            angleCenter={buttonBackgroundGradient.center}
            locations={buttonBackgroundGradient.locations}
            colors={buttonBackgroundGradient.colors}
            style={styles.gradientView}
          />
          <View style={styles.buttonInnerBorder} />
          <View style={styles.content}>
            <Caption>
              {I18n.t(
                "features.itWallet.presentation.trustmark.cta"
              ).toUpperCase()}
            </Caption>
            {!enableIridescence && (
              <Image
                style={styles.trustmarkAsset}
                source={require("../../../../../img/features/itWallet/credential/trustmark.png")}
                accessibilityIgnoresInvertColors
              />
            )}
          </View>
          {enableIridescence && <SkiaIridescentTrustmark />}
        </Animated.View>
      </Pressable>
      {trustmarkBottomSheet.bottomSheet}
    </>
  );
};

export const QrCodeBottomSheetContent = ({
  credential
}: {
  credential: StoredCredential;
}) => (
  <View>
    <VStack space={24}>
      <QrCodeImage
        size={170}
        value={generateTrustmarkUrl(credential, itwEaaVerifierBaseUrl)}
      />
      <VStack space={8}>
        <H6>{getCredentialNameFromType(credential.credentialType)}</H6>
        <Body>
          {I18n.t("features.itWallet.presentation.trustmark.usageDescription")}
        </Body>
      </VStack>
      <FeatureInfo
        iconName="security"
        body={I18n.t("features.itWallet.presentation.trustmark.certifiedLabel")}
      />
    </VStack>
    <VSpacer size={24} />
  </View>
);

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
    borderColor: hexToRgba(buttonInnerBorderColor, 0.35),
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
