/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import { Option } from "fp-ts/lib/Option";
import { Content, Text } from "native-base";
import * as React from "react";
import { Image } from "react-native";
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
import { PayloadForAction } from "../../../types/utils";

type NavigationParams = {
  error: Option<
    PayloadForAction<
      | typeof paymentVerifica["failure"]
      | typeof paymentAttiva["failure"]
      | typeof paymentIdPolling["failure"]
    >
  >;
};

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = NavigationInjectedProps &
  OwnProps &
  ReturnType<typeof mapDispatchToProps>;

class ErrorTransactionScreen extends React.Component<Props> {
  public render() {
    const error = this.props.navigation.getParam("error");
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.firstTransactionSummary.header")}
      >
        <Content noPadded={true}>
          <Image source={this.renderErrorIcon(error)} />
          <Text>{this.renderErrorMessageType(error)}</Text>
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
      case "PAYMENT_ONGOING":
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
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome())
});

export default connect(mapDispatchToProps)(ErrorTransactionScreen);
