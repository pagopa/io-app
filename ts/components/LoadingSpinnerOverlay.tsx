import {
  ButtonOutline,
  H3,
  IOColors,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../i18n";
import { IOStyles } from "./core/variables/IOStyles";
import BoxedRefreshIndicator from "./ui/BoxedRefreshIndicator";
import { Overlay } from "./ui/Overlay";

const styles = StyleSheet.create({
  textCaption: {
    padding: 24
  }
});

type Props = Readonly<{
  children?: React.ReactNode;
  isLoading: boolean;
  loadingCaption?: string;
  loadingOpacity?: number;
  onCancel?: () => void;
}>;

/**
 * A Component to display and overlay spinner conditionally
 */
const LoadingSpinnerOverlay = ({
  children,
  isLoading,
  loadingCaption,
  loadingOpacity = 0.7,
  onCancel
}: Props) => {
  const theme = useIOTheme();

  return (
    <Overlay
      backgroundColor={hexToRgba(
        IOColors[theme["appBackground-primary"]],
        loadingOpacity
      )}
      foreground={
        isLoading && (
          <BoxedRefreshIndicator
            caption={
              <View style={styles.textCaption}>
                <H3
                  color={theme["textHeading-secondary"]}
                  accessible={true}
                  style={{ textAlign: "center" }}
                >
                  {loadingCaption || I18n.t("global.remoteStates.wait")}
                </H3>
              </View>
            }
            action={
              onCancel && (
                <View style={IOStyles.selfCenter}>
                  <ButtonOutline
                    accessibilityLabel={I18n.t("global.buttons.cancel")}
                    onPress={onCancel}
                    testID="loadingSpinnerOverlayCancelButton"
                    label={I18n.t("global.buttons.cancel")}
                  />
                </View>
              )
            }
          />
        )
      }
    >
      {children}
    </Overlay>
  );
};

export default LoadingSpinnerOverlay;
