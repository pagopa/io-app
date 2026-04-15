import { StyleSheet, View } from "react-native";
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
  children?: ReactNode;
  foreground?: ReactNode;
  opacity?: number;
}>;

/**
 * Creates a full screen overlay on top of another screen.
 *
 * Used for loading spinners and error screens.
 *
 * @deprecated This component is really old and it's already used
 * in many components with different tasks. We should refactor
 * the existing components with a more specific component
 * for each case.
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
