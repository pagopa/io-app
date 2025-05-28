import { ColorValue, StyleSheet, View } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { ReactNode } from "react";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0
  },
  back: {
    zIndex: 0
  }
});

type Props = Readonly<{
  backgroundColor?: ColorValue;
  children?: ReactNode;
  foreground?: ReactNode;
  opacity?: number;
}>;

/**
 * Creates a full screen overlay on top of another screen for `AlertModal`
 */
export const AlertModalOverlay = ({
  backgroundColor = IOColors.white,
  opacity = 1,
  children,
  foreground
}: Props) => (
  <View style={styles.container} testID={"overlayComponent"}>
    <View
      style={[
        styles.backdrop,
        {
          opacity,
          backgroundColor
        }
      ]}
    />
    {foreground && <View style={styles.overlay}>{foreground}</View>}
    <View style={[styles.container, styles.back]}>{children}</View>
  </View>
);
