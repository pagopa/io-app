import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors } from "../core/variables/IOColors";

const DEFAULT_OVERLAY_OPACITY = 1;
const DEFAULT_BACKGROUND_COLOR = IOColors.white;

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
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
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
  backgroundColor?: string;
}>;

/**
 * Creates a full screen overlay on top of another screen.
 *
 * Used for loading spinners and error screens.
 */
export const Overlay: React.SFC<Props> = props => {
  const {
    opacity = DEFAULT_OVERLAY_OPACITY,
    backgroundColor = DEFAULT_BACKGROUND_COLOR
  } = props;
  return (
    <View style={styles.container} testID={"overlayComponent"}>
      {props.foreground && (
        <View
          style={[
            styles.overlay,
            {
              opacity,
              backgroundColor
            }
          ]}
        >
          {props.foreground}
        </View>
      )}

      <View style={[styles.container, styles.back]}>{props.children}</View>
    </View>
  );
};
