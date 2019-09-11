import hoistNonReactStatics from "hoist-non-react-statics";
import { Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import ButtonWithoutOpacity from "../ButtonWithoutOpacity";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";
import { Overlay } from "../ui/Overlay";

const styles = StyleSheet.create({
  textCaption: {
    padding: variables.contentPadding
  },
  cancelButtonStyle: {
    alignSelf: "center"
  }
});

/**
 * A HOC to display and overlay spinner conditionally
 *
 * @param WrappedComponent The react component you want to wrap
 * @param spinnerProps Props to pass to the spinner component
 */
export function withLoadingSpinner<
  P extends Readonly<{
    isLoading: boolean;
    loadingCaption?: string;
    loadingOpacity?: number;
    onCancel?: any;
  }>
>(WrappedComponent: React.ComponentType<P>) {
  class WithLoadingSpinner extends React.Component<P> {
    public render() {
      const {
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
            isLoading ? (
              <BoxedRefreshIndicator
                caption={
                  <Text alignCenter={true} style={styles.textCaption}>
                    {loadingCaption ? loadingCaption : ""}
                  </Text>
                }
                action={
                  onCancel && (
                    <ButtonWithoutOpacity
                      onPress={onCancel}
                      cancel={true}
                      style={styles.cancelButtonStyle}
                    >
                      <Text>{I18n.t("global.buttons.cancel")}</Text>
                    </ButtonWithoutOpacity>
                  )
                }
              />
            ) : (
              undefined
            )
          }
        >
          <WrappedComponent {...this.props} />
        </Overlay>
      );
    }
  }
  hoistNonReactStatics(WithLoadingSpinner, WrappedComponent);

  return WithLoadingSpinner;
}
