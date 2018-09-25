import { Option } from "fp-ts/lib/Option";
import { Button, H2, Text } from "native-base";
import * as React from "react";
import { Image, Modal, StyleSheet, View } from "react-native";
import { connect } from "react-redux";

import I18n from "../../i18n";
import { Action, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

export type WithErrorModalInjectedProps = {
  error: Option<string>;
};

export type WithErrorModalProps<P> = P &
  WithErrorModalInjectedProps &
  ReduxProps;

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
 * @param errorMessage The error message to show when errorSelector returns a value
 * @param cancelActionCreator A function that accept the WrappedComponent props and return a redux Action to dispatch.
 *                            We pass in props to make possible to create action like cancelSomething(props.id)
 * @param retryActionCreator A function that accept the WrappedComponent props and return a redux Action to dispatch.
 *                           We pass in props to make possible to create action like loadSomething(props.id)
 */
export function withErrorModal<P>(
  WrappedComponent: React.ComponentType<P>,
  errorSelector: (state: GlobalState) => Option<string>,
  errorMessage: string,
  cancelActionCreator: (
    props: Readonly<WithErrorModalProps<P>>
  ) => Action | undefined,
  retryActionCreator: (
    props: Readonly<WithErrorModalProps<P>>
  ) => Action | undefined
) {
  class WithErrorModal extends React.Component<WithErrorModalProps<P>> {
    public render() {
      const { error, dispatch } = this.props;

      const cancelAction = cancelActionCreator(this.props);
      const onCancelPressHandler = cancelAction
        ? () => dispatch(cancelAction)
        : undefined;
      const retryAction = retryActionCreator(this.props);
      const onRetryPressHandler = retryAction
        ? () => dispatch(retryAction)
        : undefined;

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
              {this.renderButtons(onCancelPressHandler, onRetryPressHandler)}
            </View>
          </Modal>
        </React.Fragment>
      );
    }

    private renderButtons = (
      onCancelPressHandler?: () => Action,
      onRetryPressHandler?: () => Action
    ) => {
      if (
        onCancelPressHandler === undefined &&
        onRetryPressHandler === undefined
      ) {
        return null;
      }

      return (
        <View style={styles.buttonsContainer}>
          {onCancelPressHandler && (
            <Button
              onPress={onCancelPressHandler}
              style={styles.buttonCancel}
              light={true}
              block={true}
            >
              <Text style={styles.buttonCancelText}>
                {I18n.t("global.buttons.cancel")}
              </Text>
            </Button>
          )}
          {onCancelPressHandler &&
            onRetryPressHandler && <View style={styles.separator} />}
          {onRetryPressHandler && (
            <Button
              primary={true}
              block={true}
              onPress={onRetryPressHandler}
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
