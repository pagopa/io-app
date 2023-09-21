import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors, hexToRgba } from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";
import { Overlay } from "../../../components/ui/Overlay";
import ItwLoadingSpinner from "./ItwLoadingSpinner";

const styles = StyleSheet.create({
  main: {
    padding: customVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

type Props = Readonly<{
  isLoading: boolean;
  captionTitle?: string;
  captionSubtitle?: string;
  loadingOpacity?: number;
  children: React.ReactNode;
  onCancel?: () => void;
}>;

/**
 * A Component to display and overlay animated spinner conditionally
 */
const ItwLoadingSpinnerOverlay: React.FunctionComponent<Props> = (
  props: Props
) => {
  const {
    children,
    isLoading,
    loadingOpacity = 1,
    captionTitle,
    captionSubtitle
  } = props;

  return (
    <Overlay
      backgroundColor={hexToRgba(IOColors.white, loadingOpacity)}
      foreground={
        isLoading && (
          <View style={styles.main}>
            <ItwLoadingSpinner
              color={IOColors.blue}
              captionTitle={captionTitle}
              captionSubtitle={captionSubtitle}
            />
          </View>
        )
      }
    >
      {children}
    </Overlay>
  );
};

export default ItwLoadingSpinnerOverlay;
