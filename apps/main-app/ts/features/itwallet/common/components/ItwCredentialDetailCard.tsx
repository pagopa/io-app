import { IOVisualCostants } from "@io-app/design-system";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { memo, PropsWithChildren } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLayoutSize } from "../hooks/useLayoutSize";
import { borderVariantByStatus } from "../utils/itwCredentialUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils";
import { ItwBrandedSkiaBorder } from "./ItwBrandedSkiaBorder";
import { getCardBackgroundImage } from "./ItwCredentialCard/backgroundUtils";
import {
  canBlendNatively,
  CardPattern
} from "./ItwCredentialCard/CardBackground";
import { SkiaCardPatternOverlay } from "./ItwCredentialCard/CardOverlay";
import {
  CredentialCardConfig,
  useCredentialCardConfig
} from "./ItwCredentialCard/config";

type ItwCredentialDetailCardProps = PropsWithChildren<{
  credentialStatus?: ItwCredentialStatus;
  credentialType: string;
}>;

// Height of the transparent HeaderSecondLevel navigation bar rendered above this card.
// Note: IOVisualCostants.headerHeight is 56, plus an 8px visual buffer to prevent
// children from appearing too close to the header bottom edge.
const NAVIGATION_HEADER_HEIGHT = IOVisualCostants.headerHeight + 8;
// Standard top padding for content after the header (matches IOVisualCostants.appMarginDefault).
const POST_HEADER_CONTENT_PADDING = IOVisualCostants.appMarginDefault;
// Pulls the card up by this amount so the top rounded border is hidden behind the header at rest.
const SCROLL_HACK_OFFSET = 4;
// Border radius for the card container and Skia border.
const CARD_BORDER_RADIUS = 24;

type DetailCardBackgroundProps = Pick<
  CredentialCardConfig,
  "background" | "color" | "overlay"
>;

/**
 * Static part of the header, drawn with native views: the gradient with the
 * header artwork, or the solid color with the soft-light pattern.
 */
const DetailCardBackground = memo(
  ({ background, color, overlay }: DetailCardBackgroundProps) => {
    if (overlay?.header !== undefined) {
      return (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { experimental_backgroundImage: getCardBackgroundImage(background) }
          ]}
          testID="itwCredentialDetailCardBackgroundTestID"
        >
          <Image
            accessibilityIgnoresInvertColors
            fadeDuration={0}
            resizeMode="cover"
            source={overlay.header}
            style={styles.fill}
            testID="itwCredentialDetailCardArtworkTestID"
          />
        </View>
      );
    }

    if (overlay?.pattern !== undefined) {
      return (
        <View
          pointerEvents="none"
          // Caches the soft-light blend in a texture, so the animated border
          // does not make it recompute on every frame
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
          style={[StyleSheet.absoluteFill, { backgroundColor: color }]}
          testID="itwCredentialDetailCardBackgroundTestID"
        >
          <CardPattern source={overlay.pattern} />
        </View>
      );
    }

    return null;
  }
);

export const ItwCredentialDetailCard = ({
  credentialType,
  credentialStatus = "valid",
  children
}: ItwCredentialDetailCardProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { size, onLayout } = useLayoutSize();

  // Credential's header card is always in light mode
  const { color, background, overlay } = useCredentialCardConfig(
    credentialType,
    "light"
  );
  // Android < 10 ignores mixBlendMode, so the pattern stays in the Skia canvas
  const skiaPattern =
    overlay?.pattern !== undefined && !canBlendNatively()
      ? overlay.pattern
      : undefined;

  // Extend the card well above the screen so the top border is never visible at rest.
  // The negative marginTop pulls the card up, hiding the extra paddingTop above the screen.
  const paddingTop =
    safeAreaInsets.top +
    NAVIGATION_HEADER_HEIGHT +
    POST_HEADER_CONTENT_PADDING +
    SCROLL_HACK_OFFSET;

  return (
    <View
      onLayout={onLayout}
      style={[styles.container, { paddingTop }]}
      testID="itwCredentialDetailCardTestID"
    >
      {skiaPattern === undefined && (
        <DetailCardBackground
          background={background}
          color={color}
          overlay={overlay}
        />
      )}
      {/* The border needs the card size, so the canvas waits for the layout */}
      {size.width > 0 && (
        <Canvas
          style={StyleSheet.absoluteFill}
          testID="itwCredentialDetailCardCanvasTestID"
        >
          {skiaPattern !== undefined && (
            <>
              <Rect color={color} {...size} />
              <SkiaCardPatternOverlay src={skiaPattern} {...size} />
            </>
          )}
          <ItwBrandedSkiaBorder
            borderRadius={CARD_BORDER_RADIUS}
            height={size.height}
            variant={borderVariantByStatus[credentialStatus]}
            width={size.width}
          />
        </Canvas>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginTop: -SCROLL_HACK_OFFSET,
    paddingBottom: 96,
    overflow: "hidden",
    borderRadius: CARD_BORDER_RADIUS,
    borderCurve: "continuous"
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 16
  },
  // Images from require() get the asset size, which would win over
  // absoluteFill. Percentages only work in a parent without padding: in the
  // padded card container they resolve to a wrong height.
  fill: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%"
  }
});
