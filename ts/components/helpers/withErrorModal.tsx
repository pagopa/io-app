import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBButtonText } from "native-base";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";

import I18n from "../../i18n";
import variables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { H1 } from "../core/typography/H1";
import { IOColors } from "../core/variables/IOColors";
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
    backgroundColor: IOColors.bluegrey
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
    error: O.Option<E>;
    onCancel: () => void;
    onRetry?: () => void;
  }>
>(WrappedComponent: React.ComponentType<P>, errorMapping: (t: E) => string) {
  class WithErrorModal extends React.Component<P> {
    public render() {
      const { error } = this.props;

      const errorMessage = pipe(
        error,
        O.fold(
          () => "",
          e => errorMapping(e)
        )
      );

      return (
        <Overlay
          foreground={
            O.isSome(error) ? this.renderContent(errorMessage) : undefined
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
          <H1>{errorMessage}</H1>
        </View>
        {this.renderButtons()}
      </View>
    );

    private renderButtons = () => (
      <View style={styles.buttonsContainer}>
        <ButtonDefaultOpacity
          onPress={this.props.onCancel}
          style={styles.buttonCancel}
          light={true}
          block={true}
        >
          <NBButtonText white={true}>
            {I18n.t("global.buttons.cancel")}
          </NBButtonText>
        </ButtonDefaultOpacity>
        {this.props.onRetry && <View style={styles.separator} />}
        {this.props.onRetry && (
          <ButtonDefaultOpacity
            primary={true}
            block={true}
            onPress={this.props.onRetry}
            style={styles.buttonRetry}
          >
            <NBButtonText>{I18n.t("global.buttons.retry")}</NBButtonText>
          </ButtonDefaultOpacity>
        )}
      </View>
    );
  }

  return WithErrorModal;
}
