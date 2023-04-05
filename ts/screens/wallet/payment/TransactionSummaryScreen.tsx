import {
  AmountInEuroCents,
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ActionSheet } from "native-base";
import * as React from "react";
import { View, SafeAreaView } from "react-native";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
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
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
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
  withPaymentFeatureSelector
} from "../../../store/reducers/wallet/wallets";
import { PayloadForAction } from "../../../types/utils";
import { cleanTransactionDescription } from "../../../utils/payment";
import { alertNoPayablePaymentMethods } from "../../../utils/paymentMethod";
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
  messageId?: string;
}>;

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "PAYMENT_TRANSACTION_SUMMARY"
>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

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
    if (O.toUndefined(error) !== O.toUndefined(prevProps.error)) {
      // in case the verifica returns an error indicating the payment has been
      // already completed for this notice, we update the payment state so that
      // the notice result paid
      pipe(
        error,
        O.filter(_ => _ === "PAA_PAGAMENTO_DUPLICATO"),
        O.map(_ => this.props.onDuplicatedPayment())
      );
      if (O.isSome(error)) {
        this.props.navigateToPaymentTransactionError(error);
      }
    } else if (
      potVerifica !== prevProps.potVerifica &&
      pot.isError(potVerifica)
    ) {
      this.props.navigateToPaymentTransactionError(O.some(potVerifica.error));
    } else if (
      // this is the case when the component is already mounted (eg. process more payments)
      // we check if the rptId is different from the previous one, in that case fire the dispatchPaymentVerificaRequest
      pot.isNone(this.props.potVerifica) &&
      this.props.route.params.rptId.paymentNoticeNumber !==
        prevProps.route.params.rptId.paymentNoticeNumber
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
    pipe(
      this.props.error,
      O.fold(
        () => this.renderFooterButtons(),
        error =>
          error === "PAA_PAGAMENTO_DUPLICATO"
            ? this.renderFooterSingleButton()
            : this.renderFooterButtons()
      )
    );

  public render(): React.ReactNode {
    const rptId: RptId = this.props.route.params.rptId;

    const { potVerifica } = this.props;

    const recipient = pipe(
      pot.toOption(potVerifica),
      O.chainNullableK(_ => _.enteBeneficiario),
      O.map(formatTextRecipient)
    );

    /**
     * try to show the organization fiscal code coming from the 'verifica' API
     * otherwise (it could be an issue with the API) it fallbacks on rptID coming from
     * static data: message, qrcode, manual insertion
     */
    const organizationFiscalCode: string = pipe(
      pot.toOption(potVerifica),
      O.chainNullableK(
        _ => _.enteBeneficiario?.identificativoUnivocoBeneficiario
      ),
      O.getOrElse(() => rptId.organizationFiscalCode)
    );

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
      <View style={IOStyles.rowSpaceBetween}>
        <Body color="white">{label}</Body>
        <Body weight="SemiBold" color="white">
          {value}
        </Body>
      </View>
    );

    return (
      <BaseScreenComponent
        goBack={this.handleBackPress}
        dark={true}
        headerBackgroundColor={IOColors.milderGray}
      >
        <FocusAwareStatusBar
          backgroundColor={IOColors.milderGray}
          barStyle={"light-content"}
        />
        <SafeAreaView style={IOStyles.flex}>
          <SlidedContentComponent dark={true}>
            <PaymentSummaryComponent
              dark={true}
              title={I18n.t("wallet.firstTransactionSummary.title")}
              description={transactionDescription}
              recipient={pipe(
                recipient,
                O.fold(
                  () => "-",
                  r => r
                )
              )}
            />

            <VSpacer size={24} />
            <ItemSeparatorComponent noPadded={true} />
            <VSpacer size={24} />

            {/** Amount to pay */}
            <View style={IOStyles.rowSpaceBetween}>
              <View style={IOStyles.rowSpaceBetween}>
                <H2 color="white" weight="SemiBold">
                  {I18n.t("wallet.firstTransactionSummary.updatedAmount")}
                </H2>
              </View>
              <H2 color="white" weight="Bold">
                {currentAmount}
              </H2>
            </View>

            <React.Fragment>
              <VSpacer size={8} />
              <Body color="white">
                {I18n.t("wallet.firstTransactionSummary.amountInfo.message")}
              </Body>
            </React.Fragment>
            <VSpacer size={24} />

            <ItemSeparatorComponent noPadded={true} />
            <VSpacer size={24} />

            {standardRow(
              I18n.t("wallet.firstTransactionSummary.entityCode"),
              organizationFiscalCode
            )}
            <VSpacer size={8} />
            {standardRow(
              I18n.t("payment.noticeCode"),
              PaymentNoticeNumberFromString.encode(rptId.paymentNoticeNumber)
            )}
            <VSpacer size={24} />
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
  const maybeFavoriteWallet = pipe(
    favouriteWallet,
    O.fromNullable,
    O.filter(fw => {
      switch (fw.paymentMethod?.kind) {
        case "PayPal":
          return isPaypalEnabled;
        case "BPay":
          return isBPayPaymentEnabled;
        default:
          return true;
      }
    })
  );
  const psps = pspsV2.psps;
  const error: O.Option<
    PayloadForAction<
      | typeof paymentVerifica["failure"]
      | typeof paymentAttiva["failure"]
      | typeof paymentIdPolling["failure"]
    >
  > = pot.isError(verifica)
    ? O.some(verifica.error)
    : pot.isError(attiva)
    ? O.some(attiva.error)
    : pot.isError(paymentId)
    ? O.some(paymentId.error)
    : pot.isError(check) || isError(psps)
    ? O.some(undefined)
    : O.none;

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
    (O.isNone(error) && pot.isSome(attiva) && pot.isNone(paymentId)) ||
    pot.isLoading(paymentId) ||
    (O.isNone(error) && pot.isSome(paymentId) && pot.isNone(check)) ||
    pot.isLoading(check) ||
    (O.isSome(maybeFavoriteWallet) &&
      O.isNone(error) &&
      pot.isSome(check) &&
      isUndefined(psps)) ||
    (O.isSome(maybeFavoriteWallet) && isRemoteLoading(psps));

  const loadingCaption = isLoadingVerifica
    ? I18n.t("wallet.firstTransactionSummary.loadingMessage.verification")
    : isLoadingAttiva
    ? I18n.t("wallet.firstTransactionSummary.loadingMessage.activation")
    : isLoadingWalletById
    ? I18n.t("wallet.firstTransactionSummary.loadingMessage.wallet")
    : I18n.t("wallet.firstTransactionSummary.loadingMessage.generic");

  const hasPayableMethods = withPaymentFeatureSelector(state).length > 0;
  return {
    error,
    isLoading,
    loadingCaption,
    loadingOpacity: 0.98,
    potVerifica: verifica,
    paymentId,
    maybeFavoriteWallet,
    hasPayableMethods,
    walletById
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const rptId = props.route.params.rptId;
  const initialAmount = props.route.params.initialAmount;
  const paymentStartOrigin = props.route.params.paymentStartOrigin;
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
    error: O.Option<
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
        inPayment: O.none,
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
          rptId: props.route.params.rptId,
          kind: "DUPLICATED"
        })
      )
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(TransactionSummaryScreen));
