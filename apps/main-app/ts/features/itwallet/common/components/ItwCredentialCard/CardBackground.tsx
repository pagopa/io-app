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
import { useIsScreenFocused } from "../../hooks/useIsScreenFocused";
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
  // Skia's Canvas can fail to paint its first frame when it mounts while the
  // screen is mid-transition (e.g. switching to the Wallet tab right after a
  // keyboard dismissal), leaving the card with only its white base color.
  // Keying the Canvas on the focus state forces a remount when the screen
  // regains focus, guaranteeing a fresh surface that repaints correctly.
  const isFocused = useIsScreenFocused();

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
      onLayout={onLayout}
    >
      <Canvas
        key={isFocused ? "focused" : "unfocused"}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
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
 * @deprecated Only used for the older Documenti su IO, will be removed in the future
 */
const legacyCredentialCardBackgrounds: { [type: string]: number } = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: require("../../../../../../img/features/itWallet/cards/dc.png"),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: require("../../../../../../img/features/itWallet/cards/ts.png"),
  [CredentialType.DRIVING_LICENSE]: require("../../../../../../img/features/itWallet/cards/mdl.png")
};

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the future
 */
const legacyCredentialGradientColors: { [type: string]: Array<string> } = {
  [CredentialType.EDUCATION_DEGREE]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ENROLLMENT]: ["#E0F2CE", "#ECECEC"],
  [CredentialType.RESIDENCY]: ["#F2E4CE", "#ECECEC"],
  [CredentialType.EDUCATION_DIPLOMA]: ["#F2F1CE", "#ECECEC"],
  [CredentialType.EDUCATION_ATTENDANCE]: ["#F2F1CE", "#ECECEC"]
};

type LegacyProps = {
  credentialType: string;
  colorScheme: CardColorScheme;
};

/**
 * @deprecated Only used for the older Documenti su IO, will be removed in the future
 */
export const LegacyCardBackground = ({
  credentialType,
  colorScheme
}: LegacyProps) => {
  const { size, onLayout } = useLayoutSize();
  const image = useCachedImage(legacyCredentialCardBackgrounds[credentialType]);
  const loadingOverlayOpacity = useSharedValue(1);
  // See CardBackground: remount the Skia Canvas on focus to avoid a blank
  // (white) background when it fails to paint its first frame mid-transition.
  const isFocused = useIsScreenFocused();

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
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: IOColors.white }
      ]}
      onLayout={onLayout}
    >
      <Animated.View
        style={[
          loadingOverlayOpacityTransition,
          StyleSheet.absoluteFillObject,
          { backgroundColor: IOColors["grey-100"] }
        ]}
      />
      <Canvas key={isFocused ? "focused" : "unfocused"} style={{ flex: 1 }}>
        {image ? (
          <SkiaImage
            image={image}
            fit="fill"
            width={size.width}
            height={size.height}
            opacity={colorScheme === "default" ? 1 : 0.4}
          >
            {colorScheme === "greyscale" && (
              <BlendColor color="white" mode="color" />
            )}
          </SkiaImage>
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
              colors={gradientColors}
            />
          </RoundedRect>
        )}
      </Canvas>
    </View>
  );
};
