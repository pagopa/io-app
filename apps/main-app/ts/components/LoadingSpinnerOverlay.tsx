import {
  H3,
  hexToRgba,
  IOButton,
  IOColors,
  useIOTheme
} from "@io-app/design-system";
import I18n from "i18next";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

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

/** A Component to display and overlay spinner conditionally */
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
            action={
              onCancel && (
                <View style={{ alignSelf: "center" }}>
                  <IOButton
                    label={I18n.t("global.buttons.cancel")}
                    onPress={onCancel}
                    testID="loadingSpinnerOverlayCancelButton"
                    variant="outline"
                  />
                </View>
              )
            }
            caption={
              <View style={styles.textCaption}>
                <H3
                  accessible={true}
                  color={theme["textHeading-secondary"]}
                  style={{ textAlign: "center" }}
                >
                  {loadingCaption || I18n.t("global.remoteStates.wait")}
                </H3>
              </View>
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
