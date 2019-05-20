/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import { Option } from "fp-ts/lib/Option";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { navigateToWalletHome } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentAttiva,
  paymentIdPolling,
  paymentVerifica
} from "../../../store/actions/wallet/payment";
import customVariables from "../../../theme/variables";
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
  onRetry: () => void;
};

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  contentWrapper: {
    alignItems: "center"
  },

  errorMessage: {
    fontSize: customVariables.fontSize2,
    paddingTop: customVariables.contentPadding,
    textAlign: "center"
  },

  errorMessageSubtitle: {
    textAlign: "center",
    fontSize: customVariables.fontSizeSmall
  }
});

/**
 * Print the icon according to current error status
 * @param error
 */
export const renderErrorTransactionIcon = (
  error: NavigationParams["error"]
) => {
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
};

/**
 * Convert the error code into a user-readable string
 * @param error
 */
export const renderErrorTransactionMessage = (
  error: NavigationParams["error"]
): string => {
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
};

class TransactionErrorScreen extends React.Component<Props> {
  public render() {
    const error = this.props.navigation.getParam("error");
    const canRetry: boolean = error
      .filter(
        _ =>
          _ === "INVALID_AMOUNT" ||
          _ === "PAYMENT_ID_TIMEOUT" ||
          _ === "PAYMENT_ONGOING" ||
          _ === "PAYMENT_UNAVAILABLE" ||
          _ === undefined
      )
      .isSome();
    return (
      <BaseScreenComponent
        goBack={this.onPressCancel}
        headerTitle={I18n.t("wallet.firstTransactionSummary.header")}
      >
        <Content>
          <View style={styles.contentWrapper}>
            <View spacer={true} extralarge={true} />

            <Image source={renderErrorTransactionIcon(error)} />
            <View spacer={true} />
            <Text bold={true} style={styles.errorMessage}>
              {renderErrorTransactionMessage(error)}
            </Text>
            <View spacer={true} extralarge={true} />

            {canRetry && <View spacer={true} extralarge={true} />}
            {canRetry && (
              <Text style={styles.errorMessageSubtitle}>
                {I18n.t("wallet.errorTransaction.submitBugText")}
              </Text>
            )}
          </View>
        </Content>
        {this.renderButtons(canRetry)}
      </BaseScreenComponent>
    );
  }

  /**
   * Render footer buttons, cancel and retry buttons are rendered conditionally.
   */
  private renderButtons = (canRetry: boolean) => {
    const cancelButtonProps = {
      block: true,
      light: true,
      cancel: true,
      onPress: this.onPressCancel,
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
      block: true,
      primary: true,
      onPress: this.onPressRetry,
      title: I18n.t("global.buttons.retry")
    };
    const closeButtonProps = {
      block: true,
      bordered: true,
      light: true,
      onPress: this.onPressCancel,
      title: I18n.t("global.buttons.close")
    };
    return canRetry ? (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps}
        rightButton={retryButtonProps}
      />
    ) : (
      <FooterWithButtons type="SingleButton" leftButton={closeButtonProps} />
    );
  };

  private onPressCancel = () => {
    if (this.props.navigation.state.params !== undefined) {
      this.props.navigation.state.params.onCancel();
    }
  };

  private onPressRetry = () => {
    const navigationParams = this.props.navigation.state.params;
    if (navigationParams !== undefined) {
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

export default connect(mapDispatchToProps)(TransactionErrorScreen);
