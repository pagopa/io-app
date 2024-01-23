import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  Body,
  ButtonOutline,
  IOColors,
  IOStyles,
  LoadingSpinner,
  hexToRgba
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";

const styles = StyleSheet.create({
  back: {
    zIndex: 0
  },
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
    justifyContent: "center",
    opacity: 1
  },
  refreshBox: {
    height: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  textCaption: {
    padding: 24
  },
  whiteBg: {
    backgroundColor: IOColors.white
  }
});

type Props = Readonly<{
  backgroundColor?: string;
  isLoading: boolean;
  loadingCaption?: string;
  opacity?: number;
  onCancel?: () => void;
  children: React.ReactNode;
}>;

/**
 * A Component to display and overlay spinner conditionally
 */
export const DSLoadingSpinnerOverlay = ({
  backgroundColor,
  isLoading,
  loadingCaption,
  opacity = 1,
  onCancel,
  children
}: Props) => (
  <View style={styles.container} testID={"overlayComponent"}>
    {isLoading && (
      <View
        style={[
          styles.overlay,
          {
            opacity,
            backgroundColor:
              backgroundColor ?? hexToRgba(IOColors.white, opacity)
          }
        ]}
      >
        <View style={[styles.refreshBox, styles.whiteBg]}>
          <LoadingSpinner testID="refreshIndicator" />
          <View style={styles.textCaption}>
            <Body accessible={true} style={{ textAlign: "center" }}>
              {loadingCaption || I18n.t("global.remoteStates.wait")}
            </Body>
          </View>
          {onCancel && (
            <View style={IOStyles.selfCenter}>
              <ButtonOutline
                accessibilityLabel={I18n.t("global.buttons.cancel")}
                onPress={onCancel}
                testID="loadingSpinnerOverlayCancelButton"
                label={I18n.t("global.buttons.cancel")}
              />
            </View>
          )}
        </View>
      </View>
    )}
    <View style={[styles.container, styles.back]}>{children}</View>
  </View>
);
