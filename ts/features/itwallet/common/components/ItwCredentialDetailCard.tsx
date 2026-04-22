import {
  IOVisualCostants,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import { Canvas } from "@shopify/react-native-skia";
import { PropsWithChildren, useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { borderVariantByStatus } from "../utils/itwCredentialUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils";
import { ItwBrandedSkiaBorder } from "./ItwBrandedSkiaBorder";
import { CredentialCardSkiaBackground } from "./ItwCredentialCard/CredentialCardBackground";
import { getCredentialCardConfig } from "./ItwCredentialCard/credentialCardConfig";

type ItwCredentialDetailCardProps = PropsWithChildren<{
  credentialType: string;
  credentialStatus?: ItwCredentialStatus;
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
  const { themeType } = useIOThemeContext();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { background, detailWatermarkLayer } =
    getCredentialCardConfig(credentialType);

  // Extend the card well above the screen so the top border is never visible at rest.
  // The negative marginTop pulls the card up, hiding the extra paddingTop above the screen.
  const paddingTop =
    safeAreaInsets.top +
    NAVIGATION_HEADER_HEIGHT +
    POST_HEADER_CONTENT_PADDING +
    SCROLL_HACK_OFFSET;

  const handleOnLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View style={[styles.container, { paddingTop }]} onLayout={handleOnLayout}>
      <Canvas style={StyleSheet.absoluteFill}>
        {size.width > 0 && size.height > 0 && (
          <CredentialCardSkiaBackground
            bg={background}
            width={size.width}
            height={size.height}
          />
        )}
      </Canvas>

      {detailWatermarkLayer && size.width > 0 && size.height > 0 && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Image
            accessibilityIgnoresInvertColors
            source={detailWatermarkLayer}
            style={{ width: size.width, height: size.height }}
            resizeMode="stretch"
          />
        </View>
      )}

      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <ItwBrandedSkiaBorder
          width={size.width}
          height={size.height}
          borderRadius={CARD_BORDER_RADIUS}
          themeType={themeType}
          variant={borderVariantByStatus[credentialStatus]}
        />
      </Canvas>

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
