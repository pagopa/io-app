import { IOColors } from "@io-app/design-system";
import {
  BlendColor,
  Canvas,
  LinearGradient,
  RoundedRect,
  Image as SkiaImage,
  vec
} from "@shopify/react-native-skia";
import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import { useLayoutSize } from "../../hooks/useLayoutSize";
import { useCachedImage } from "../../utils/imageCache";
import { CredentialType } from "../../utils/itwMocksUtils";
import {
  SkiaCardCornerOverlay,
  SkiaCardOverlay,
  SkiaCardPatternOverlay
} from "./CardOverlay";
import { CredentialCardConfig } from "./config";
import { SkiaGradientBackground } from "./GradientBackground";
import { CardColorScheme } from "./types";

type Props = Pick<CredentialCardConfig, "background" | "color" | "overlay">;

export const CardBackground = memo(({ background, color, overlay }: Props) => {
  const { size, onLayout } = useLayoutSize();

  return (
    <View
      onLayout={onLayout}
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
    >
      <Canvas pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <SkiaGradientBackground bg={background} {...size} />
        {overlay?.showCornerOverlay && (
          <SkiaCardCornerOverlay color={color} {...size} />
        )}
        {overlay?.pattern && (
          <SkiaCardPatternOverlay src={overlay.pattern} {...size} />
        )}
        {overlay?.card && <SkiaCardOverlay src={overlay.card} {...size} />}
      </Canvas>
    </View>
  );
});

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the
 *   future
 */
const legacyCredentialCardBackgrounds: { [type: string]: number } = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/dc.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/ts.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/mdl.png")
};

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the
 *   future
 */
const legacyCredentialGradientColors: { [type: string]: Array<string> } = {
  [CredentialType.EDUCATION_DEGREE]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ENROLLMENT]: ["#E0F2CE", "#ECECEC"],
  [CredentialType.RESIDENCY]: ["#F2E4CE", "#ECECEC"],
  [CredentialType.EDUCATION_DIPLOMA]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ATTENDANCE]: ["#F2F1CE", "#ECECEC"]
};

type LegacyProps = {
  colorScheme: CardColorScheme;
  credentialType: string;
};

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the
 *   future
 */
export const LegacyCardBackground = ({
  credentialType,
  colorScheme
}: LegacyProps) => {
  const { size, onLayout } = useLayoutSize();
  const image = useCachedImage(legacyCredentialCardBackgrounds[credentialType]);
  const loadingOverlayOpacity = useSharedValue(1);

  // Read the shared value directly; animation is driven from useEffect below
  const loadingOverlayOpacityTransition = useAnimatedStyle(() => ({
    opacity: loadingOverlayOpacity.value
  }));

  useEffect(() => {
    if (image && size.width > 0 && size.height > 0) {
      // eslint-disable-next-line functional/immutable-data
      loadingOverlayOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.ease
      });
    }
  }, [image, loadingOverlayOpacity, size]);

  const gradientColors = legacyCredentialGradientColors[credentialType] || [
    IOColors["grey-100"],
    IOColors["grey-200"]
  ];

  return (
    <View
      onLayout={onLayout}
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
    >
      <Animated.View
        style={[
          loadingOverlayOpacityTransition,
          StyleSheet.absoluteFillObject,
          { backgroundColor: IOColors["grey-100"] }
        ]}
      />
      <Canvas style={{ flex: 1 }}>
        {image ? (
          <SkiaImage
            fit="fill"
            height={size.height}
            image={image}
            opacity={colorScheme === "default" ? 1 : 0.4}
            width={size.width}
          >
            {colorScheme === "greyscale" && (
              <BlendColor color="white" mode="color" />
            )}
          </SkiaImage>
        ) : (
          <RoundedRect
            height={size.height}
            r={16}
            width={size.width}
            x={0}
            y={0}
          >
            <LinearGradient
              colors={gradientColors}
              end={vec(size.width, size.height)}
              start={vec(0, 0)}
            />
          </RoundedRect>
        )}
      </Canvas>
    </View>
  );
};
