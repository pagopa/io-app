import { Text as NBText } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../i18n";
import variables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import BoxedRefreshIndicator from "./ui/BoxedRefreshIndicator";
import { Overlay } from "./ui/Overlay";

const styles = StyleSheet.create({
  textCaption: {
    padding: variables.contentPadding
  },
  cancelButtonStyle: {
    alignSelf: "center"
  }
});

type Props = Readonly<{
  isLoading: boolean;
  loadingCaption?: string;
  loadingOpacity?: number;
  onCancel?: () => void;
}>;

/**
 * A Component to display and overlay spinner conditionally
 */
class LoadingSpinnerOverlay extends React.Component<Props> {
  public render() {
    const {
      children,
      isLoading,
      loadingCaption,
      loadingOpacity = 0.7,
      onCancel
    } = this.props;
    return (
      <Overlay
        backgroundColor={`rgba(255, 255, 255, ${loadingOpacity})`}
        // TODO: Replace reference to RGB with formatted value from IOColors,
        // using `hexToRgba` function
        foreground={
          isLoading && (
            <BoxedRefreshIndicator
              caption={
                <NBText
                  alignCenter={true}
                  style={styles.textCaption}
                  accessible={true}
                >
                  {loadingCaption || I18n.t("global.remoteStates.wait")}
                </NBText>
              }
              action={
                onCancel && (
                  <ButtonDefaultOpacity
                    onPress={onCancel}
                    cancel={true}
                    style={styles.cancelButtonStyle}
                  >
                    <NBText>{I18n.t("global.buttons.cancel")}</NBText>
                  </ButtonDefaultOpacity>
                )
              }
            />
          )
        }
      >
        {children}
      </Overlay>
    );
  }
}

export default LoadingSpinnerOverlay;
