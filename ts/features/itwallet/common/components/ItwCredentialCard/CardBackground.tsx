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
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { CredentialType } from "../../utils/itwMocksUtils";
import {
  CardBackgroundConfig,
  getCredentialCardConfig
} from "./credentialCardConfig";
import { CardColorScheme } from "./types";

type ItwCredentialCardBackgroundProps = {
  credentialType: string;
  colorScheme: CardColorScheme;
};

/**
 * Computes the Skia LinearGradient start/end vectors for a given angle
 * (CSS convention: 0° = bottom→top, 90° = left→right) and canvas dimensions.
 * The resulting line passes through the center and is long enough to cover
 * all four corners of the rectangle.
 */
const getGradientVectors = (
  angle: number,
  width: number,
  height: number
): { start: ReturnType<typeof vec>; end: ReturnType<typeof vec> } => {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const cx = width / 2;
  const cy = height / 2;
  // Minimum half-length that covers every corner when projected on the direction
  const d = Math.abs(cx * dx) + Math.abs(cy * dy);
  return {
    start: vec(cx - dx * d, cy - dy * d),
    end: vec(cx + dx * d, cy + dy * d)
  };
};

const L3Background = ({
  bg,
  width,
  height
}: {
  bg: CardBackgroundConfig;
  width: number;
  height: number;
}) => {
  if (bg.type === "solid") {
    return <Rect x={0} y={0} width={width} height={height} color={bg.color} />;
  }

  const { start, end } = getGradientVectors(bg.angle, width, height);
  return (
    <Rect x={0} y={0} width={width} height={height}>
      <LinearGradient
        start={start}
        end={end}
        colors={bg.colors}
        positions={bg.positions}
      />
    </Rect>
  );
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

  const config = getCredentialCardConfig(credentialType);
  const legacyGradientColors = legacyCredentialGradientColors[credentialType];
  const SvgLayer = withL3Design ? config.svgLayer : undefined;

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
          <L3Background
            bg={config.background}
            width={size.width}
            height={size.height}
          />
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
                legacyGradientColors ?? [
                  IOColors["grey-100"],
                  IOColors["grey-200"]
                ]
              }
            />
          </RoundedRect>
        )}
      </Canvas>
      {SvgLayer && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <SvgLayer width="100%" height="100%" />
        </View>
      )}
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
  [CredentialType.RESIDENCY]: ["#F2E4CE", "#ECECEC"],
  [CredentialType.EDUCATION_DIPLOMA]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ATTENDANCE]: ["#F2F1CE", "#ECECEC"]
};
