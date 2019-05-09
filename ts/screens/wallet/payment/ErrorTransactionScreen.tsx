/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import { Option } from "fp-ts/lib/Option";
import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { navigateToWalletHome } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentAttiva,
  paymentIdPolling,
  paymentVerifica
} from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";
import { PayloadForAction } from "../../../types/utils";

type NavigationParams = {
  error: Option<
    PayloadForAction<
      | typeof paymentVerifica["failure"]
      | typeof paymentAttiva["failure"]
      | typeof paymentIdPolling["failure"]
    >
  >;
  onCancel: () => void;
  onRetry?: () => void;
};

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = NavigationInjectedProps &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
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

class ErrorTransactionScreen extends React.Component<Props> {
  public render() {
    const error = this.props.navigation.getParam("error");
    return (
      <BaseScreenComponent
        goBack={this.onPressCancel}
        headerTitle={I18n.t("wallet.firstTransactionSummary.header")}
      >
        <Content noPadded={true}>
          <Image source={this.renderErrorIcon(error)} />
          <Text>{this.renderErrorMessageType(error)}</Text>

          {this.renderButtons()}
        </Content>
      </BaseScreenComponent>
    );
  }

  /**
   * Convert the error code into a user-readable string
   * @param error
   */
  private renderErrorMessageType(error: NavigationParams["error"]): string {
    switch (error.toUndefined()) {
      case "PAYMENT_DUPLICATED":
        return I18n.t("wallet.errors.PAYMENT_DUPLICATED");
      case "INVALID_AMOUNT":
        return I18n.t("wallet.errors.INVALID_AMOUNT");
      case "PAYMENT_ONGOING":
        return I18n.t("wallet.errors.PAYMENT_ONGOING");
      case "PAYMENT_EXPIRED":
        return I18n.t("wallet.errors.PAYMENT_EXPIRED");
      case "PAYMENT_UNAVAILABLE":
        return I18n.t("wallet.errors.PAYMENT_UNAVAILABLE");
      case "PAYMENT_UNKNOWN":
        return I18n.t("wallet.errors.PAYMENT_UNKNOWN");
      case "DOMAIN_UNKNOWN":
        return I18n.t("wallet.errors.DOMAIN_UNKNOWN");
      case "PAYMENT_ID_TIMEOUT":
        return I18n.t("wallet.errors.MISSING_PAYMENT_ID");
      default:
        return I18n.t("wallet.errors.GENERIC_ERROR");
    }
  }

  /**
   * Print the icon according to current error status
   * @param error
   */
  private renderErrorIcon(error: NavigationParams["error"]) {
    const baseIconPath = "../../../../img/wallet/errors/";
    switch (error.toUndefined()) {
      case "PAYMENT_DUPLICATED":
        return require(baseIconPath + "payment-duplicated-icon.png");
      case "INVALID_AMOUNT":
        return require(baseIconPath + "invalid-amount-icon.png");
      case "PAYMENT_ONGOING":
        return require(baseIconPath + "payment-ongoing-icon.png");
      case "PAYMENT_EXPIRED":
        return require(baseIconPath + "payment-expired-icon.png");
      case "PAYMENT_UNAVAILABLE":
        return require(baseIconPath + "payment-unavailable-icon.png");
      case "PAYMENT_UNKNOWN":
        return require(baseIconPath + "payment-unknown-icon.png");
      case "DOMAIN_UNKNOWN":
        return require(baseIconPath + "domain-unknown-icon.png");
      case "PAYMENT_ID_TIMEOUT":
        return require(baseIconPath + "missing-payment-id-icon.png");
      default:
        return require(baseIconPath + "generic-error-icon.png");
    }
  }

  /**
   * Render footer buttons, cancel and retry buttons are rendered conditionally.
   */
  private renderButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        <Button
          onPress={this.onPressCancel}
          style={styles.buttonCancel}
          light={true}
          block={true}
        >
          <Text style={styles.buttonCancelText}>
            {I18n.t("global.buttons.cancel")}
          </Text>
        </Button>
        <Button
          primary={true}
          block={true}
          onPress={this.onPressRetry}
          style={styles.buttonRetry}
        >
          <Text>{I18n.t("global.buttons.retry")}</Text>
        </Button>
      </View>
    );
  };

  private onPressCancel = () => {
    if (this.props.navigation.state.params !== undefined) {
      this.props.navigation.state.params.onCancel();
    }
  };

  private onPressRetry = () => {
    const navigationParams = this.props.navigation.state.params;
    if (
      navigationParams !== undefined &&
      navigationParams.onRetry !== undefined
    ) {
      // Go back in TransactionSummaryScreen
      this.props.navigation.goBack();
      // Retry the payment
      navigationParams.onRetry();
    }
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome())
});

export default connect(mapDispatchToProps)(ErrorTransactionScreen);
