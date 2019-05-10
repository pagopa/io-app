import { Option } from "fp-ts/lib/Option";
import { Button, H2, Text } from "native-base";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";

import I18n from "../../i18n";
import variables from "../../theme/variables";
import { Overlay } from "../ui/Overlay";

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    padding: variables.contentPadding
  },

  imageAndMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  image: {
    marginBottom: 20
  },

  buttonsContainer: {
    flexDirection: "row",
    marginTop: "auto"
  },

  buttonCancel: {
    flex: 4,
    backgroundColor: variables.brandDarkGray
  },

  separator: {
    width: 10
  },

  buttonRetry: {
    flex: 8
  }
});

/**
 * A HOC to display a modal to notify the user an error occurred.
 * Inside the modal cancel and retry buttons are rendered conditionally.
 *
 * @param WrappedComponent The react component you want to wrap
 * @param errorSelector A redux selector that returns the error (as string) or undefined
 * @param errorMapping A mapping function that converts the extracted error (if any) into a user-readable string
 */
export function withErrorModal<
  E,
  P extends Readonly<{
    error: Option<E>;
    onCancel: () => void;
    onRetry?: () => void;
  }>
>(WrappedComponent: React.ComponentType<P>, errorMapping: (t: E) => string) {
  class WithErrorModal extends React.Component<P> {
    public render() {
      const { error } = this.props;

      const errorMessage = error.fold("", e => errorMapping(e));

      return (
        <Overlay
          opacity={1}
          foreground={
            error.isSome() ? this.renderContent(errorMessage) : undefined
          }
        >
          <WrappedComponent {...this.props} />
        </Overlay>
      );
    }

    private renderContent = (errorMessage: string) => (
      <View style={styles.contentWrapper}>
        <View style={styles.imageAndMessageContainer}>
          <Image
            style={styles.image}
            source={require("../../../img/error.png")}
          />
          <H2>{errorMessage}</H2>
        </View>
        {this.renderButtons()}
      </View>
    );

    private renderButtons = () => {
      return (
        <View style={styles.buttonsContainer}>
          <Button
            onPress={this.props.onCancel}
            style={styles.buttonCancel}
            light={true}
            block={true}
          >
            <Text white={true}>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
          {this.props.onRetry && <View style={styles.separator} />}
          {this.props.onRetry && (
            <Button
              primary={true}
              block={true}
              onPress={this.props.onRetry}
              style={styles.buttonRetry}
            >
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </Button>
          )}
        </View>
      );
    };
  }

  return WithErrorModal;
}
