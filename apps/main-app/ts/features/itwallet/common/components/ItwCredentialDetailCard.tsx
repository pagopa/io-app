import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLayoutSize } from "../hooks/useLayoutSize";
import { borderVariantByStatus } from "../utils/itwCredentialUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils";
import { ItwBrandedSkiaBorder } from "./ItwBrandedSkiaBorder";
import {
  SkiaCardOverlay,
  SkiaCardPatternOverlay
} from "./ItwCredentialCard/CardOverlay";
import { useCredentialCardConfig } from "./ItwCredentialCard/config";
import { SkiaGradientBackground } from "./ItwCredentialCard/GradientBackground";

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

  // Extend the card well above the screen so the top border is never visible at rest.
  // The negative marginTop pulls the card up, hiding the extra paddingTop above the screen.
  const paddingTop =
    safeAreaInsets.top +
    NAVIGATION_HEADER_HEIGHT +
    POST_HEADER_CONTENT_PADDING +
    SCROLL_HACK_OFFSET;

  return (
    <View onLayout={onLayout} style={[styles.container, { paddingTop }]}>
      {size && (
        <Canvas style={StyleSheet.absoluteFill}>
          {overlay?.header && (
            <>
              <SkiaGradientBackground bg={background} {...size} />
              <SkiaCardOverlay src={overlay.header} {...size} />
            </>
          )}
          {overlay?.pattern && (
            <>
              {/* Pattern should have a solid background */}
              <Rect color={color} {...size} />
              <SkiaCardPatternOverlay src={overlay.pattern} {...size} />
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
  }
});
