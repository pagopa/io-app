import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  overlay: {
    position: "absolute",
    inset: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: IOColors.white,
    zIndex: 1,
    justifyContent: "center"
  },
  back: {
    zIndex: 0
  }
});

type Props = Readonly<{
  backgroundColor?: string;
  children?: React.ReactNode;
  foreground?: React.ReactNode;
  opacity?: number;
}>;

/**
 * Creates a full screen overlay on top of another screen.
 *
 * Used for loading spinners and error screens.
 */
export const Overlay = ({
  backgroundColor = IOColors.white,
  children,
  foreground,
  opacity = 1
}: Props) => (
  <View style={styles.container} testID={"overlayComponent"}>
    {foreground && (
      <View
        style={[
          styles.overlay,
          {
            opacity,
            backgroundColor
          }
        ]}
      >
        {foreground}
      </View>
    )}
    <View style={[styles.container, styles.back]}>{children}</View>
  </View>
);
