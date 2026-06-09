import {
  IOButton,
  H3,
  IOColors,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";

import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import BoxedRefreshIndicator from "./ui/BoxedRefreshIndicator";
import { Overlay } from "./ui/Overlay";

const styles = StyleSheet.create({
  textCaption: {
    padding: 24
  }
});

type Props = Readonly<{
  children?: ReactNode;
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
                <View style={{ alignSelf: "center" }}>
                  <IOButton
                    variant="outline"
                    label={I18n.t("global.buttons.cancel")}
                    onPress={onCancel}
                    testID="loadingSpinnerOverlayCancelButton"
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
