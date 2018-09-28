import { Option } from "fp-ts/lib/Option";
import { Button, H2, Text } from "native-base";
import * as React from "react";
import { Image, Modal, StyleSheet, View } from "react-native";
import { connect } from "react-redux";

import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

export type WithErrorModalInjectedProps<E> = {
  error: Option<E>;
};

export type WithErrorModalProps<P, E> = P & WithErrorModalInjectedProps<E>;

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

  buttonCancelText: {
    color: variables.colorWhite
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
 * @param onCancel Function that will be called if the user presses the "cancel" button. This will need to clear the
 *                 stored error to hide the modal
 * @param onRetry Function that will be called if the user presses the "retry" button. This will need to clear the
 *                stored error to hide the modal
 */
export function withErrorModal<P, E = string>(
  WrappedComponent: React.ComponentType<P>,
  errorSelector: (state: GlobalState) => Option<E>,
  errorMapping: (t: E) => string,
  onCancel?: () => void,
  onRetry?: () => void
) {
  class WithErrorModal extends React.Component<WithErrorModalProps<P, E>> {
    public render() {
      const { error } = this.props;

      const errorMessage = error.fold("", e => errorMapping(e));

      return (
        <React.Fragment>
          <WrappedComponent {...this.props} />
          <Modal visible={error.isSome()} onRequestClose={() => undefined}>
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
          </Modal>
        </React.Fragment>
      );
    }

    private renderButtons = () => {
      if (onCancel === undefined && onRetry === undefined) {
        return null;
      }

      return (
        <View style={styles.buttonsContainer}>
          {onCancel && (
            <Button
              onPress={onCancel}
              style={styles.buttonCancel}
              light={true}
              block={true}
            >
              <Text style={styles.buttonCancelText}>
                {I18n.t("global.buttons.cancel")}
              </Text>
            </Button>
          )}
          {onCancel && onRetry && <View style={styles.separator} />}
          {onRetry && (
            <Button
              primary={true}
              block={true}
              onPress={onRetry}
              style={styles.buttonRetry}
            >
              <Text>{I18n.t("global.buttons.retry")}</Text>
            </Button>
          )}
        </View>
      );
    };
  }

  const mapStateToProps = (state: GlobalState) => ({
    error: errorSelector(state)
  });

  return connect(mapStateToProps)(WithErrorModal);
}
