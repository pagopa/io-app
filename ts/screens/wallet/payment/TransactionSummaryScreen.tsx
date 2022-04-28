import {
  AmountInEuroCents,
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { CompatNavigationProp } from "@react-navigation/compat";
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { ActionSheet, Text, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { PaymentSummaryComponent } from "../../../components/wallet/PaymentSummaryComponent";
import { SlidedContentComponent } from "../../../components/wallet/SlidedContentComponent";
import {
  isError,
  isLoading as isRemoteLoading,
  isUndefined
} from "../../../features/bonus/bpd/model/RemoteValue";
import I18n from "../../../i18n";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import {
  navigateToPaymentManualDataInsertion,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentTransactionErrorScreen,
  navigateToWalletAddPaymentMethod,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  abortRunningPayment,
  backToEntrypointPayment,
  paymentAttiva,
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentInitializeState,
  PaymentStartOrigin,
  paymentVerifica,
  runDeleteActivePaymentSaga,
  runStartOrResumePaymentActivationSaga
} from "../../../store/actions/wallet/payment";
import { fetchWalletsRequestWithExpBackoff } from "../../../store/actions/wallet/wallets";
import {
  bancomatPayConfigSelector,
  isPaypalEnabledSelector
} from "../../../store/reducers/backendStatus";
import { GlobalState } from "../../../store/reducers/types";
import {
  getFavoriteWallet,
  getPagoPAMethodsSelector,
  getPayablePaymentMethodsSelector
} from "../../../store/reducers/wallet/wallets";
import customVariables from "../../../theme/variables";
import { PayloadForAction } from "../../../types/utils";
import { cleanTransactionDescription } from "../../../utils/payment";
import {
  alertNoActivePayablePaymentMethods,
  alertNoPayablePaymentMethods
} from "../../../utils/paymentMethod";
import { showToast } from "../../../utils/showToast";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../utils/stringBuilder";
import { formatTextRecipient } from "../../../utils/strings";
import { dispatchPickPspOrConfirm } from "./common";

export type TransactionSummaryScreenNavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  paymentStartOrigin: PaymentStartOrigin;
}>;

type OwnProps = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<WalletParamsList, "PAYMENT_TRANSACTION_SUMMARY">
  >;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const styles = StyleSheet.create({
  lighterGray: {
    color: customVariables.lighterGray
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
    fontSize: 20
  },
  flex: {
    flex: 1
  }
});

/**
 * This screen shows the transaction details once the payment has been verified
 * (to check if it is valid and if the amount has been updated)
 */
class TransactionSummaryScreen extends React.Component<Props> {
  public componentDidMount() {
    if (pot.isNone(this.props.potVerifica)) {
      // on component mount, fetch the payment summary if we haven't already
      this.props.dispatchPaymentVerificaRequest();
    }
    if (!pot.isSome(this.props.walletById)) {
      this.props.loadWallets();
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { error, potVerifica } = this.props;
    if (error.toUndefined() !== prevProps.error.toUndefined()) {
      // in case the verifica returns an error indicating the payment has been
      // already completed for this notice, we update the payment state so that
      // the notice result paid
      error
        .filter(_ => _ === "PAA_PAGAMENTO_DUPLICATO")
        .map(_ => this.props.onDuplicatedPayment());
      if (error.isSome()) {
        this.props.navigateToPaymentTransactionError(error);
      }
    } else if (
      potVerifica !== prevProps.potVerifica &&
      pot.isError(potVerifica)
    ) {
      this.props.navigateToPaymentTransactionError(some(potVerifica.error));
    } else if (
      // this is the case when the component is already mounted (eg. process more payments)
      // we check if the rptId is different from the previous one, in that case fire the dispatchPaymentVerificaRequest
      pot.isNone(this.props.potVerifica) &&
      this.props.navigation.getParam("rptId").paymentNoticeNumber !==
        prevProps.navigation.getParam("rptId").paymentNoticeNumber
    ) {
      this.props.dispatchPaymentVerificaRequest();
    }
  }

  private handleBackPress = () => {
    if (pot.isSome(this.props.paymentId)) {
      // If we have a paymentId (payment check already done) we need to
      // ask the user to cancel the payment and in case reset it
      ActionSheet.show(
        {
          options: [
            I18n.t("wallet.ConfirmPayment.confirmCancelPayment"),
            I18n.t("wallet.ConfirmPayment.confirmContinuePayment")
          ],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          title: I18n.t("wallet.ConfirmPayment.confirmCancelTitle")
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            this.props.backToEntrypointPayment();
            this.props.resetPayment();
            showToast(
              I18n.t("wallet.ConfirmPayment.cancelPaymentSuccess"),
              "success"
            );
          }
        }
      );
    } else {
      this.props.navigation.goBack();
    }
  };

  private getSecondaryButtonProps = () => ({
    bordered: pot.isNone(this.props.paymentId),
    cancel: pot.isSome(this.props.paymentId),
    onPress: this.handleBackPress,
    title: I18n.t("global.buttons.cancel")
  });

  private renderFooterSingleButton() {
    return (
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={this.getSecondaryButtonProps()}
      />
    );
  }

  private handleContinueOnPress = (verifica: PaymentRequestsGetResponse) => {
    const { maybeFavoriteWallet, hasPayableMethods } = this.props;
    if (hasPayableMethods) {
      this.props.startOrResumePayment(
        verifica,
        maybeFavoriteWallet,
        hasPayableMethods
      );
      return;
    }
    if (this.props.hasPagoPaMethods) {
      alertNoActivePayablePaymentMethods(this.props.navigateToWalletHome);
      return;
    }
    alertNoPayablePaymentMethods(this.props.navigateToWalletAddPaymentMethod);
  };

  private renderFooterButtons() {
    const { potVerifica } = this.props;
    const basePrimaryButtonProps = {
      primary: true,
      title: I18n.t("wallet.continue")
    };

    const primaryButtonProps =
      pot.isSome(potVerifica) &&
      !(pot.isLoading(potVerifica) || pot.isError(potVerifica))
        ? {
            ...basePrimaryButtonProps,
            disabled: false,
            onPress: () => this.handleContinueOnPress(potVerifica.value)
          }
        : {
            ...basePrimaryButtonProps,
            disabled: true
          };

    return (
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={this.getSecondaryButtonProps()}
        rightButton={primaryButtonProps}
      />
    );
  }

  private getFooterButtons = () =>
    this.props.error.fold(this.renderFooterButtons(), error =>
      error === "PAA_PAGAMENTO_DUPLICATO"
        ? this.renderFooterSingleButton()
        : this.renderFooterButtons()
    );

  public render(): React.ReactNode {
    const rptId: RptId = this.props.navigation.getParam("rptId");

    const { potVerifica } = this.props;

    const recipient = pot
      .toOption(potVerifica)
      .mapNullable(_ => _.enteBeneficiario)
      .map(formatTextRecipient);

    const currentAmount: string = pot.getOrElse(
      pot.map(potVerifica, (verifica: PaymentRequestsGetResponse) =>
        formatNumberAmount(
          centsToAmount(verifica.importoSingoloVersamento),
          true
        )
      ),
      "-"
    );

    const transactionDescription = pot.getOrElse<string>(
      pot.mapNullable(potVerifica, pv =>
        cleanTransactionDescription(pv.causaleVersamento)
      ),
      "-"
    );

    const standardRow = (label: string, value: string) => (
      <View style={styles.row}>
        <Text style={styles.lighterGray}>{label}</Text>
        <Text bold={true} white={true}>
          {value}
        </Text>
      </View>
    );

    return (
      <BaseScreenComponent
        goBack={this.handleBackPress}
        dark={true}
        headerBackgroundColor={customVariables.milderGray}
      >
        <FocusAwareStatusBar
          backgroundColor={customVariables.milderGray}
          barStyle={"light-content"}
        />
        <SafeAreaView style={styles.flex}>
          <SlidedContentComponent dark={true}>
            <PaymentSummaryComponent
              dark={true}
              title={I18n.t("wallet.firstTransactionSummary.title")}
              description={transactionDescription}
              recipient={recipient.fold("-", r => r)}
            />

            <View spacer={true} large={true} />
            <ItemSeparatorComponent noPadded={true} />
            <View spacer={true} large={true} />

            {/** Amount to pay */}
            <View style={styles.row}>
              <View style={styles.row}>
                <Text style={[styles.title, styles.lighterGray]}>
                  {I18n.t("wallet.firstTransactionSummary.updatedAmount")}
                </Text>
              </View>
              <Text white={true} style={[styles.title]} bold={true}>
                {currentAmount}
              </Text>
            </View>

            <React.Fragment>
              <View spacer={true} small={true} />
              <Text style={styles.lighterGray}>
                {I18n.t("wallet.firstTransactionSummary.updateInfo")}
              </Text>
            </React.Fragment>
            <View spacer={true} large={true} />

            <ItemSeparatorComponent noPadded={true} />
            <View spacer={true} large={true} />

            {standardRow(
              I18n.t("wallet.firstTransactionSummary.entityCode"),
              rptId.organizationFiscalCode
            )}
            <View spacer={true} small={true} />
            {standardRow(
              I18n.t("payment.noticeCode"),
              PaymentNoticeNumberFromString.encode(rptId.paymentNoticeNumber)
            )}
            <View spacer={true} large={true} />
          </SlidedContentComponent>
          {this.getFooterButtons()}
        </SafeAreaView>
      </BaseScreenComponent>
    );
  }
}

// eslint-disable-next-line complexity,sonarjs/cognitive-complexity
const mapStateToProps = (state: GlobalState) => {
  const { verifica, attiva, paymentId, check, pspsV2 } = state.wallet.payment;
  const walletById = state.wallet.wallets.walletById;
  const isPaypalEnabled = isPaypalEnabledSelector(state);
  const isBPayPaymentEnabled = bancomatPayConfigSelector(state).payment;
  const favouriteWallet = pot.toUndefined(getFavoriteWallet(state));
  /**
   * the favourite will be undefined if one of these condition is true
   * - payment method is Paypal & the relative feature flag is not enabled
   * - payment method is BPay & the relative feature flag is not enabled
   */
  const maybeFavoriteWallet = fromNullable(favouriteWallet).filter(fw => {
    switch (fw.paymentMethod?.kind) {
      case "PayPal":
        return isPaypalEnabled;
      case "BPay":
        return isBPayPaymentEnabled;
      default:
        return true;
    }
  });
  const psps = pspsV2.psps;
  const error: Option<
    PayloadForAction<
      | typeof paymentVerifica["failure"]
      | typeof paymentAttiva["failure"]
      | typeof paymentIdPolling["failure"]
    >
  > = pot.isError(verifica)
    ? some(verifica.error)
    : pot.isError(attiva)
    ? some(attiva.error)
    : pot.isError(paymentId)
    ? some(paymentId.error)
    : pot.isError(check) || isError(psps)
    ? some(undefined)
    : none;

  // we need to show the spinner when the data is in the loading state
  // and also while the logic is processing one step's response and
  // starting the next step's loading request
  const isLoadingVerifica = pot.isLoading(verifica);
  const isLoadingAttiva = pot.isLoading(attiva);
  const isLoadingWalletById = pot.isLoading(walletById);
  const isLoading =
    isLoadingWalletById ||
    isLoadingVerifica ||
    isLoadingAttiva ||
    (error.isNone() && pot.isSome(attiva) && pot.isNone(paymentId)) ||
    pot.isLoading(paymentId) ||
    (error.isNone() && pot.isSome(paymentId) && pot.isNone(check)) ||
    pot.isLoading(check) ||
    (maybeFavoriteWallet.isSome() &&
      error.isNone() &&
      pot.isSome(check) &&
      isUndefined(psps)) ||
    (maybeFavoriteWallet.isSome() && isRemoteLoading(psps));

  const loadingCaption = isLoadingVerifica
    ? I18n.t("wallet.firstTransactionSummary.loadingMessage.verification")
    : isLoadingAttiva
    ? I18n.t("wallet.firstTransactionSummary.loadingMessage.activation")
    : isLoadingWalletById
    ? I18n.t("wallet.firstTransactionSummary.loadingMessage.wallet")
    : I18n.t("wallet.firstTransactionSummary.loadingMessage.generic");

  const hasPayableMethods = getPayablePaymentMethodsSelector(state).length > 0;
  const hasPagoPaMethods = getPagoPAMethodsSelector(state).length > 0;

  return {
    error,
    isLoading,
    loadingCaption,
    loadingOpacity: 0.98,
    potVerifica: verifica,
    paymentId,
    maybeFavoriteWallet,
    hasPayableMethods,
    hasPagoPaMethods,
    walletById
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const rptId = props.navigation.getParam("rptId");
  const initialAmount = props.navigation.getParam("initialAmount");
  const paymentStartOrigin = props.navigation.getParam("paymentStartOrigin");
  const isManualPaymentInsertion = paymentStartOrigin === "manual_insertion";

  const dispatchPaymentVerificaRequest = () =>
    dispatch(
      paymentVerifica.request({ rptId, startOrigin: paymentStartOrigin })
    );

  const resetPayment = () => {
    dispatch(runDeleteActivePaymentSaga());
    dispatch(paymentInitializeState());
  };

  const onCancel = () => {
    dispatch(abortRunningPayment());
  };

  const startOrResumePayment = (
    verifica: PaymentRequestsGetResponse,
    maybeFavoriteWallet: ReturnType<
      typeof mapStateToProps
    >["maybeFavoriteWallet"],
    hasPayableMethods: ReturnType<typeof mapStateToProps>["hasPayableMethods"]
  ) =>
    dispatch(
      runStartOrResumePaymentActivationSaga({
        rptId,
        verifica,
        onSuccess: idPayment =>
          dispatchPickPspOrConfirm(dispatch)(
            rptId,
            initialAmount,
            verifica,
            idPayment,
            maybeFavoriteWallet,
            () => {
              // either we cannot use the default payment method for this
              // payment, or fetching the PSPs for this payment and the
              // default wallet has failed, ask the user to pick a wallet

              navigateToPaymentPickPaymentMethodScreen({
                rptId,
                initialAmount,
                verifica,
                idPayment
              });
            },
            hasPayableMethods
          )
      })
    );

  const navigateToPaymentTransactionError = (
    error: Option<
      PayloadForAction<
        | typeof paymentVerifica["failure"]
        | typeof paymentAttiva["failure"]
        | typeof paymentIdPolling["failure"]
      >
    >
  ) =>
    navigateToPaymentTransactionErrorScreen({
      error,
      onCancel,
      rptId
    });

  const dispatchNavigateToPaymentManualDataInsertion = () =>
    navigateToPaymentManualDataInsertion({
      isInvalidAmount: isManualPaymentInsertion
    });

  return {
    loadWallets: () => dispatch(fetchWalletsRequestWithExpBackoff()),
    navigateToWalletHome: () => navigateToWalletHome(),
    backToEntrypointPayment: () => dispatch(backToEntrypointPayment()),
    navigateToWalletAddPaymentMethod: () =>
      navigateToWalletAddPaymentMethod({
        inPayment: none,
        showOnlyPayablePaymentMethods: true
      }),
    dispatchPaymentVerificaRequest,
    navigateToPaymentTransactionError,
    dispatchNavigateToPaymentManualDataInsertion,
    startOrResumePayment,
    isManualPaymentInsertion,
    goBack: () => {
      props.navigation.goBack();
      // reset the payment state
      dispatch(paymentInitializeState());
    },
    resetPayment,
    onCancel,
    onDuplicatedPayment: () =>
      dispatch(
        paymentCompletedSuccess({
          rptId: props.navigation.getParam("rptId"),
          kind: "DUPLICATED"
        })
      )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(TransactionSummaryScreen));
