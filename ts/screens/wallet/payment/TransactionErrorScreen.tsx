/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import { differenceInMinutes } from "date-fns";
import { Option, some } from "fp-ts/lib/Option";
import { BugReporting } from "instabug-reactnative";
import { RptId, RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { setInstabugUserAttribute } from "../../../boot/configureInstabug";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { navigateToPaymentManualDataInsertion } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  backToEntrypointPayment,
  paymentAttiva,
  paymentIdPolling,
  paymentVerifica
} from "../../../store/actions/wallet/payment";
import { paymentsLastDeletedStateSelector } from "../../../store/reducers/payments/lastDeleted";
import { GlobalState } from "../../../store/reducers/types";
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
  rptId: RptId;
  onCancel: () => void;
  onRetry: () => void;
};

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

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
    textAlign: "center"
  },

  paddedLR: {
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding
  }
});

const MAX_MINUTES_FOR_PAYMENT_DELETION = 15;

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
  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  private handleBackPress = () => {
    this.props.backToEntrypointPayment();
    return true;
  };

  // Save the rptId as attribute and open the Instabug chat.
  private sendPaymentBlockedBug = () => {
    const rptId = this.props.navigation.getParam("rptId");
    setInstabugUserAttribute(
      "blockedPaymentRptId",
      RptIdFromString.encode(rptId)
    );
    BugReporting.showWithOptions(BugReporting.reportType.bug, [
      BugReporting.option.commentFieldRequired
    ]);
  };

  // Render a specific screen for the ON_GOING error.
  private renderPaymentOngoingError = () => {
    const rptId = this.props.navigation.getParam("rptId");
    const lastDeleted = this.props.lastDeleted;

    if (
      lastDeleted !== null &&
      RptIdFromString.encode(lastDeleted.rptId) ===
        RptIdFromString.encode(rptId)
    ) {
      // We have requested the deletion of this rptId
      const deletedMinutesAgo = differenceInMinutes(Date.now(), lastDeleted.at);
      // We must wait 15 minutes from the deletion
      const deleteInProgress =
        deletedMinutesAgo < MAX_MINUTES_FOR_PAYMENT_DELETION;

      const errorMessage = deleteInProgress
        ? I18n.t("wallet.errors.PAYMENT_ONGOING_CANCELLED", {
            remainingMinutes: 15 - deletedMinutesAgo
          })
        : I18n.t("wallet.errors.PAYMENT_ONGOING_CANCELLED_TIMEOUT");

      return (
        <React.Fragment>
          <Image source={renderErrorTransactionIcon(some("PAYMENT_ONGOING"))} />
          <View spacer={true} />
          <Text bold={true} style={styles.errorMessage}>
            {errorMessage}
          </Text>
          {!deleteInProgress && (
            <React.Fragment>
              <View spacer={true} extralarge={true} />
              <ButtonDefaultOpacity
                block={true}
                onPress={this.sendPaymentBlockedBug}
              >
                <Text>Invia segnalazione</Text>
              </ButtonDefaultOpacity>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Image source={renderErrorTransactionIcon(some("PAYMENT_ONGOING"))} />
        <View spacer={true} />
        <Text bold={true} style={styles.errorMessage}>
          {I18n.t("wallet.errors.PAYMENT_ONGOING_NOCANCEL")}
        </Text>
        <View spacer={true} extralarge={true} />
        <Text style={styles.errorMessageSubtitle}>
          {I18n.t("wallet.errors.PAYMENT_ONGOING_NOCANCEL_TIMEOUT")}
        </Text>
        <View spacer={true} extralarge={true} />
        <ButtonDefaultOpacity block={true} onPress={this.sendPaymentBlockedBug}>
          <Text>{I18n.t("wallet.errors.sendReport")}</Text>
        </ButtonDefaultOpacity>
      </React.Fragment>
    );
  };

  public render() {
    const error = this.props.navigation.getParam("error");

    const canRetry: boolean = error
      .filter(
        _ =>
          _ === "INVALID_AMOUNT" ||
          _ === "PAYMENT_ID_TIMEOUT" ||
          _ === "PAYMENT_UNAVAILABLE" ||
          _ === undefined
      )
      .isSome();
    return (
      <BaseScreenComponent
        goBack={this.onPressCancel}
        headerTitle={I18n.t("wallet.firstTransactionSummary.header")}
      >
        <Content noPadded={true} style={styles.paddedLR}>
          <View style={styles.contentWrapper}>
            <View spacer={true} extralarge={true} />

            {error.isSome() && error.value === "PAYMENT_ONGOING" ? (
              this.renderPaymentOngoingError()
            ) : (
              <React.Fragment>
                <Image source={renderErrorTransactionIcon(error)} />
                <View spacer={true} />
                <Text bold={true} style={styles.errorMessage}>
                  {renderErrorTransactionMessage(error)}
                </Text>
                <View spacer={true} extralarge={true} />

                {canRetry && (
                  <React.Fragment>
                    <View spacer={true} extralarge={true} />
                    <Text style={styles.errorMessageSubtitle}>
                      {I18n.t("wallet.errorTransaction.submitBugText")}
                    </Text>
                  </React.Fragment>
                )}
              </React.Fragment>
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
      cancel: true,
      onPress: this.onPressCancel,
      title: I18n.t("global.buttons.cancel")
    };
    const retryButtonProps = {
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
        type={"TwoButtonsInlineThird"}
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

const mapStateToProps = (state: GlobalState) => ({
  lastDeleted: paymentsLastDeletedStateSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPaymentManualDataInsertion: (isInvalidAmount: boolean) =>
    dispatch(navigateToPaymentManualDataInsertion({ isInvalidAmount })),
  backToEntrypointPayment: () => dispatch(backToEntrypointPayment())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionErrorScreen);
