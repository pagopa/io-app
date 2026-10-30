import { IOColors } from "@io-app/design-system";
import { Canvas } from "@shopify/react-native-skia";
import { memo } from "react";
import { ImageRequireSource, StyleSheet, View } from "react-native";

import { useIsScreenFocused } from "../../hooks/useIsScreenFocused";
import { useLayoutSize } from "../../hooks/useLayoutSize";
import { SkiaCardCornerOverlay, SkiaCardPatternOverlay } from "./CardOverlay";
import { CredentialCardConfig } from "./config";
import { SkiaGradientBackground } from "./GradientBackground";

type Props = Pick<CredentialCardConfig, "background" | "color"> & {
  pattern: ImageRequireSource;
  showCornerOverlay?: boolean;
};

/**
 * Skia version of the background of a card with a pattern overlay, used only
 * where native views cannot draw the soft-light pattern (Android < 10 ignores
 * `mixBlendMode`).
 */
export const SkiaCardBackground = memo(
  ({ background, color, pattern, showCornerOverlay }: Props) => {
    const { size, onLayout } = useLayoutSize();
    // Skia's Canvas can fail to paint its first frame when it mounts while the
    // screen is mid-transition (e.g. switching to the Wallet tab right after a
    // keyboard dismissal), leaving the card with only its white base color.
    // Keying the Canvas on the focus state forces a remount when the screen
    // regains focus, guaranteeing a fresh surface that repaints correctly.
    const isFocused = useIsScreenFocused();

    return (
      <View
        onLayout={onLayout}
        style={[StyleSheet.absoluteFill, { backgroundColor: IOColors.white }]}
        testID="itwCredentialCardSkiaBackgroundTestID"
      >
        <Canvas
          key={isFocused ? "focused" : "unfocused"}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <SkiaGradientBackground bg={background} {...size} />
          {showCornerOverlay && (
            <SkiaCardCornerOverlay color={color} {...size} />
          )}
          <SkiaCardPatternOverlay src={pattern} {...size} />
        </Canvas>
      </View>
    );
  }
);
