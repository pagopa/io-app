import { useIOThemeContext } from "@pagopa/io-app-design-system";
import { Canvas } from "@shopify/react-native-skia";
import { PropsWithChildren, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColorByCredentialType } from "../utils/itwStyleUtils";
import { ItwBrandedSkiaBorder } from "./ItwBrandedSkiaBorder";

type ItwCredentialDetailCardProps = PropsWithChildren<{
  credentialType: string;
}>;

export const ItwCredentialDetailCard = ({
  credentialType,
  children
}: ItwCredentialDetailCardProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { backgroundColor } = useThemeColorByCredentialType(credentialType);
  const { themeType } = useIOThemeContext();
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Extend the card well above the screen so the top border is never visible at rest.
  // The negative marginTop pulls the card up, hiding the extra paddingTop above the screen.
  const SCROLL_HACK_OFFSET = 4;
  const paddingTop = safeAreaInsets.top + 64 + 24 + SCROLL_HACK_OFFSET;

  const handleOnLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View
      style={[styles.container, { paddingTop, backgroundColor }]}
      onLayout={handleOnLayout}
    >
      {/* Skia canvas for the ITW branded gradient border */}
      <Canvas style={StyleSheet.absoluteFill}>
        <ItwBrandedSkiaBorder
          width={size.width}
          height={size.height}
          borderRadius={24}
          themeType={themeType}
        />
      </Canvas>

      {/* Card content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginTop: -4,
    paddingBottom: 96,
    overflow: "hidden",
    borderRadius: 24,
    borderCurve: "continuous"
  },
  content: {
    alignItems: "center"
  }
});
