import { Text } from "native-base";
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
      loadingOpacity,
      onCancel
    } = this.props;
    const overlayProps =
      loadingOpacity !== undefined
        ? {
            opacity: 1,
            backgroundColor: `rgba(255,255,255,${loadingOpacity})`
          }
        : undefined;
    return (
      <Overlay
        {...overlayProps}
        foreground={
          isLoading && (
            <BoxedRefreshIndicator
              caption={
                loadingCaption && (
                  <Text alignCenter={true} style={styles.textCaption}>
                    {loadingCaption}
                  </Text>
                )
              }
              action={
                onCancel && (
                  <ButtonDefaultOpacity
                    onPress={onCancel}
                    cancel={true}
                    style={styles.cancelButtonStyle}
                  >
                    <Text>{I18n.t("global.buttons.cancel")}</Text>
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
