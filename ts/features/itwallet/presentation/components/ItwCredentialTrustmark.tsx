/* eslint-disable functional/immutable-data */
import {
  Body,
  Caption,
  FeatureInfo,
  hexToRgba,
  VSpacer,
  VStack,
  WithTestID
} from "@pagopa/io-app-design-system";
import {
  Canvas,
  ImageSVG,
  Mask,
  RoundedRect,
  Skia,
  Circle as SkiaCircle,
  Group as SkiaGroup,
  Image as SkiaImage,
  RadialGradient as SkiaRadialGradient,
  useImage,
  useSVG,
  vec
} from "@shopify/react-native-skia";
import React, { useState } from "react";
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
  Extrapolate,
  interpolate,
  SensorType,
  useAnimatedReaction,
  useAnimatedSensor,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useSpringPressScaleAnimation } from "../../../../components/ui/utils/hooks/useSpringPressScaleAnimation";
import I18n from "../../../../i18n";
// import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { itwEaaVerifierBaseUrl } from "../../../../config";
import { generateTrustmarkUrl } from "../../common/utils/itwCredentialUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

// type ItwCredentialTrustmarkProps = WithTestID<{
//   credential: StoredCredential;
// }>;

type ItwCredentialTrustmarkProps = WithTestID<{
  onPress: () => void;
}>;

type ButtonSize = {
  width: LayoutRectangle["width"];
  height: LayoutRectangle["height"];
};

/* MOVEMENT
   Spring config for the light movement */
const springConfig = {
  mass: 1,
  damping: 50,
  stiffness: 200,
  overshootClamping: false
};

/* BUTTON
   Visual parameters */
const TRUSTMARK_HEIGHT = 48;
const buttonBorderRadius = 12;
const buttonInnerBorderColor: ColorValue = "#CCCCCC";
const buttonBackgroundGradient = {
  colors: ["#CCCCCC", "#F2F2F2", "#E9E9E9", "#E0E0E0"],
  locations: [0, 0.35, 0.7, 1],
  center: { x: 0.5, y: 0.7 }
};

/* LIGHT
   Visual parameters */
const lightScaleMultiplier = 1;
const lightSkiaOpacity = 0.7;
const lightSize: LayoutRectangle["width"] = 200;
/* Percentage of visible light when it's near
card boundaries */
const visibleLightPercentage = 0.25;

export const ItwCredentialTrustmark = ({
  testID,
  onPress
}: // credential
ItwCredentialTrustmarkProps) => {
  // const trustmarkBottomSheet = useIOBottomSheetAutoresizableModal({
  //   title: I18n.t("features.itWallet.presentation.trustmark.title"),
  //   component: <QrCodeBottomSheetContent credential={credential} />
  // });

  const rotationSensor = useAnimatedSensor(SensorType.ROTATION);
  const { qx } = rotationSensor.sensor.value;
  const initialQx = useSharedValue(0);

  const skiaTranslateX = useSharedValue(0);

  useAnimatedReaction(
    () => rotationSensor.sensor.value,
    s => (initialQx.value = s.qx),
    []
  );

  /* Not all devices are in an initial flat position on a surface
    (e.g. a table) then we use a relative rotation value,
    not an absolute one  */
  const relativeQx = useDerivedValue(() => qx - initialQx.value);

  /* Get both card and light sizes to set the basic boundaries */
  const [buttonSize, setButtonSize] = useState<ButtonSize>();

  const getButtonSize = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setButtonSize({ width, height });
  };

  /* Set translate boundaries */
  const maxTranslateX =
    ((buttonSize?.width ?? 0) - (lightSize ?? 0) * visibleLightPercentage) / 2;

  /* We don't need to consider the whole
    quaternion range, just the 1/10 */
  const quaternionRange: number = 0.05;

  const skiaLightTranslateValues = useDerivedValue(() => {
    skiaTranslateX.value = withSpring(
      interpolate(
        relativeQx.value,
        [-quaternionRange, quaternionRange],
        [maxTranslateX, -maxTranslateX],
        Extrapolate.CLAMP
      ),
      springConfig
    );

    return [
      { translateX: skiaTranslateX.value },
      { scale: lightScaleMultiplier }
    ];
  });

  const ButtonLight = () => (
    <SkiaGroup
      opacity={lightSkiaOpacity}
      blendMode={"colorDodge"}
      origin={vec((buttonSize?.width ?? 0) / 2, (buttonSize?.height ?? 0) / 2)}
    >
      <SkiaCircle
        cx={(buttonSize?.width ?? 0) / 2}
        cy={(buttonSize?.height ?? 0) / 2}
        r={lightSize / 2}
        transform={skiaLightTranslateValues}
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

  const { onPressIn, onPressOut, animatedScaleStyle } =
    useSpringPressScaleAnimation();

  // const trustMarkStamp = useImage(
  //   // eslint-disable-next-line @typescript-eslint/no-var-requires
  //   require("../../../../../img/features/itWallet/credential/trustmark-2x.png")
  // );

  const trustMarkStampSVG = useSVG(
    /* We use the `html` extension to avoid the `svg-transformer` used to
    render local files, as it causes conflicts with the `skia` library.
    To learn more: https://github.com/Shopify/react-native-skia/issues/1335#issuecomment-2088240523 */
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../../../../img/features/itWallet/credential/trustmark-stamp.svg.html")
  );

  return (
    <>
      <Pressable
        onPress={onPress}
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
          >
            <Caption style={styles.caption}>
              {I18n.t(
                "features.itWallet.presentation.trustmark.cta"
              ).toUpperCase()}
            </Caption>
            {/* <Image
              style={styles.logo}
              source={require("../../../../../img/features/itWallet/credential/trustmark.png")}
              accessibilityIgnoresInvertColors
            /> */}
          </LinearGradient>
          <View style={styles.buttonInnerBorder} />

          <Canvas
            style={{
              position: "absolute",
              height: TRUSTMARK_HEIGHT,
              width: "100%"
            }}
          >
            <RoundedRect
              x={0}
              y={0}
              width={buttonSize?.width ?? 0}
              height={TRUSTMARK_HEIGHT}
              r={0}
              color="rgba(0, 0, 0, 0)"
            />
            {/* <Mask mode="luminance" mask={}>
              <SkiaCircle cx={0} cy={0} r={20} color="rgba(0, 0, 0, 100)" />
            </Mask> */}
            <ButtonLight />

            {trustMarkStampSVG && (
              <ImageSVG
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                svg={trustMarkStampSVG!}
                x={(buttonSize?.width ?? 0) - TRUSTMARK_HEIGHT - 24}
                y={-TRUSTMARK_HEIGHT * 0.28}
                width={TRUSTMARK_HEIGHT * 1.6}
                height={TRUSTMARK_HEIGHT * 1.6}
              />
            )}

            {/* <SkiaImage
              image={trustMarkStamp}
              x={(buttonSize?.width ?? 0) - TRUSTMARK_HEIGHT - 24}
              y={-TRUSTMARK_HEIGHT * 0.2}
              width={TRUSTMARK_HEIGHT}
              height={TRUSTMARK_HEIGHT}
              fit="contain"
            /> */}
          </Canvas>
        </Animated.View>
      </Pressable>
      {/* {trustmarkBottomSheet.bottomSheet} */}
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
      <Body>
        {I18n.t("features.itWallet.presentation.trustmark.usageDescription")}
      </Body>
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
    borderCurve: "continuous",
    borderRadius: buttonBorderRadius,
    overflow: "hidden"
  },
  buttonInnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: buttonBorderRadius - 1,
    borderColor: hexToRgba(buttonInnerBorderColor, 0.5),
    borderWidth: 1
  },
  gradientView: {
    height: TRUSTMARK_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 16,
    position: "relative"
  },
  caption: {
    zIndex: 10
  }
  // logo: {
  //   zIndex: 1,
  //   position: "absolute",
  //   height: TRUSTMARK_HEIGHT,
  //   width: TRUSTMARK_HEIGHT,
  //   transform: [{ scale: 1.5 }],
  //   top: "5%",
  //   right: 8
  // }
});
