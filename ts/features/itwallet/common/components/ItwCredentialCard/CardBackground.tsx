import { IOColors } from "@pagopa/io-app-design-system";
import {
  BlendColor,
  Canvas,
  Image,
  LinearGradient,
  Rect,
  RoundedRect,
  useImage,
  vec
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useIOSelector } from "../../../../../store/hooks";
import { adjustColorHsl, hexToHsl } from "../../../../../utils/color";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { CredentialType } from "../../utils/itwMocksUtils";
import { CardColorScheme } from "./types";

type ItwCredentialCardBackgroundProps = {
  credentialType: string;
  colorScheme: CardColorScheme;
};

export const CardBackground = ({
  credentialType,
  colorScheme
}: ItwCredentialCardBackgroundProps) => {
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const image = useImage(legacyCredentialCardBackgrounds[credentialType]);
  const loadingOverlayOpacity = useSharedValue(1);

  const loadingOverlayOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(loadingOverlayOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  useEffect(() => {
    if (!withL3Design && image && size.width > 0 && size.height > 0) {
      // eslint-disable-next-line functional/immutable-data
      loadingOverlayOpacity.value = 0;
    }
  }, [image, loadingOverlayOpacity, size, withL3Design]);

  const gradientColors = withL3Design
    ? credentialGradientColors[credentialType]
    : legacyCredentialGradientColors[credentialType];

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
      onLayout={event => {
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      {!withL3Design && (
        <Animated.View
          style={[
            loadingOverlayOpacityTransition,
            StyleSheet.absoluteFillObject,
            { backgroundColor: IOColors["grey-100"] }
          ]}
        />
      )}
      <Canvas style={{ flex: 1 }}>
        {!withL3Design && image ? (
          <Image
            image={image}
            fit="fill"
            width={size.width}
            height={size.height}
            opacity={colorScheme === "default" ? 1 : 0.4}
          >
            {colorScheme === "greyscale" && (
              <BlendColor color="white" mode="color" />
            )}
          </Image>
        ) : withL3Design ? (
          <Rect x={0} y={0} width={size.width} height={size.height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(size.width, size.height)}
              colors={
                gradientColors ?? [IOColors["grey-100"], IOColors["grey-200"]]
              }
            />
          </Rect>
        ) : (
          <RoundedRect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            r={16}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(size.width, size.height)}
              colors={
                gradientColors ?? [IOColors["grey-100"], IOColors["grey-200"]]
              }
            />
          </RoundedRect>
        )}
      </Canvas>
    </View>
  );
};

const legacyCredentialCardBackgrounds: { [type: string]: number } = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/dc.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/ts.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/mdl.png")
};

const legacyCredentialGradientColors: { [type: string]: Array<string> } = {
  [CredentialType.EDUCATION_DEGREE]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ENROLLMENT]: ["#E0F2CE", "#ECECEC"],
  [CredentialType.RESIDENCY]: ["#F2E4CE", "#ECECEC"]
};

// Gradient colors per credential type.
// Convention: first color is the darker/more saturated one — it is used as
// the base for auto-deriving border and title colors.
export const credentialGradientColors: { [type: string]: Array<string> } = {
  [CredentialType.PID]: ["#EAF6FF", "#F6FBFF"],
  [CredentialType.DRIVING_LICENSE]: ["#F0CFDF", "#FAF0F5"],
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: ["#C5E2F5", "#EBF6FD"],
  [CredentialType.EUROPEAN_DISABILITY_CARD]: ["#C8DFF0", "#E8F3FA"],
  [CredentialType.EDUCATION_DEGREE]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ENROLLMENT]: ["#E0F2CE", "#ECECEC"],
  [CredentialType.RESIDENCY]: ["#F2E4CE", "#ECECEC"]
};

// Returns the darker of the two gradient colors (lower HSL lightness),
// used as the base for deriving border and title colors.
const getDarkerGradientColor = (colors: Array<string>): string => {
  const { l: l0 } = hexToHsl(colors[0]);
  const { l: l1 } = hexToHsl(colors[1]);
  return l0 <= l1 ? colors[0] : colors[1];
};

export const credentialBackgroundColors: { [type: string]: string } =
  Object.fromEntries(
    Object.entries(credentialGradientColors).map(([type, colors]) => [
      type,
      getDarkerGradientColor(colors)
    ])
  );

// Border and title colors are automatically derived from the darker gradient
// color using HSL adjustments that preserve the original hue:
//   border: L -0.2765, S -0.1991
//   title:  L -0.6627, S -0.2248
const derivedColors = Object.fromEntries(
  Object.entries(credentialGradientColors).map(([type]) => {
    const base = credentialBackgroundColors[type];
    return [
      type,
      {
        border: adjustColorHsl(base, -0.2765, -0.1991),
        title: adjustColorHsl(base, -0.6627, -0.2248)
      }
    ];
  })
);

export const credentialBorderColors: { [type: string]: string } =
  Object.fromEntries(
    Object.entries(derivedColors).map(([type, c]) => [type, c.border])
  );

export const credentialTitleColors: { [type: string]: string } =
  Object.fromEntries(
    Object.entries(derivedColors).map(([type, c]) => [type, c.title])
  );
