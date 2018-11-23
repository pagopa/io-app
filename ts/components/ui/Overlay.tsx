import * as React from "react";
import { StyleSheet, View } from "react-native";

const DEFAULT_OVERLAY_OPACITY = 0.7;

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
    backgroundColor: "#fff",
    zIndex: 1,
    justifyContent: "center"
  },
  back: {
    zIndex: 0
  }
});

type Props = Readonly<{
  foreground?: React.ReactNode;
  opacity?: number;
}>;

/**
 * Creates a full screen overlay on top of another screen.
 *
 * Used for loading spinners and error screens.
 */
export const Overlay: React.SFC<Props> = props => (
  <View style={styles.container}>
    {props.foreground && (
      <View
        style={[
          styles.overlay,
          {
            opacity:
              props.opacity !== undefined
                ? props.opacity
                : DEFAULT_OVERLAY_OPACITY
          }
        ]}
      >
        {props.foreground}
      </View>
    )}
    <View style={[styles.container, styles.back]}>{props.children}</View>
  </View>
);
