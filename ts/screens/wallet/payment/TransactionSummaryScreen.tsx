/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 */

import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  PaymentNoticeNumberFromString,
  RptId
} from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { ActionSheet, Content, Text, View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { EnteBeneficiario } from "../../../../definitions/backend/EnteBeneficiario";

import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import PaymentSummaryComponent from "../../../components/wallet/PaymentSummaryComponent";

import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  backToEntrypointPayment,
  paymentAttiva,
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentInitializeState,
  paymentVerifica,
  runDeleteActivePaymentSaga,
  runStartOrResumePaymentActivationSaga
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";

import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  navigateToPaymentManualDataInsertion,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentTransactionErrorScreen
} from "../../../store/actions/navigation";
import {
  getFavoriteWallet,
  walletsSelector
} from "../../../store/reducers/wallet/wallets";
import { UNKNOWN_AMOUNT, UNKNOWN_PAYMENT_REASON } from "../../../types/unknown";
import { PayloadForAction } from "../../../types/utils";
import { AmountToImporto } from "../../../utils/amounts";
import { cleanTransactionDescription } from "../../../utils/payment";
import { showToast } from "../../../utils/showToast";
import { dispatchPickPspOrConfirm } from "./common";

const basePrimaryButtonProps = {
  block: true,
  primary: true,
  title: I18n.t("wallet.continue")
};

export type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  isManualPaymentInsertion?: boolean;
}>;

type ReduxMergedProps = Readonly<{
  onRetry: () => void;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxMergedProps &
  OwnProps;

const formatTextRecipient = (e: EnteBeneficiario): string => {
  const denomUnitOper = fromNullable(e.denomUnitOperBeneficiario)
    .map(d => ` - ${d}`)
    .getOrElse("");
  const address = fromNullable(e.indirizzoBeneficiario).getOrElse("");
  const civicNumber = fromNullable(e.civicoBeneficiario)
    .map(c => ` n. ${c}`)
    .getOrElse("");
  const cap = fromNullable(e.capBeneficiario)
    .map(c => `${c} `)
    .getOrElse("");
  const city = fromNullable(e.localitaBeneficiario)
    .map(l => `${l} `)
    .getOrElse("");
  const province = fromNullable(e.provinciaBeneficiario)
    .map(p => `(${p})`)
    .getOrElse("");

  return `${e.denominazioneBeneficiario}${denomUnitOper}\n
${address}${civicNumber}\n
${cap}${city}${province}`;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.firstTransactionSummary.contextualHelpTitle",
  body: "wallet.firstTransactionSummary.contextualHelpContent"
};
class TransactionSummaryScreen extends React.Component<Props> {
  public componentDidMount() {
    if (pot.isNone(this.props.potVerifica)) {
      // on component mount, fetch the payment summary if we haven't already
      this.props.dispatchPaymentVerificaRequest();
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { error, potVerifica } = this.props;
    if (error.toUndefined() !== prevProps.error.toUndefined()) {
      // in case the verifica returns an error indicating the payment has been
      // already completed for this notice, we update the payment state so that
      // the notice result paid
      error
        .filter(_ => _ === "PAYMENT_DUPLICATED")
        .map(_ => this.props.onDuplicatedPayment());
      if (error.isSome()) {
        this.props.navigateToPaymentTransactionError(error, this.props.onRetry);
      }
    } else if (
      potVerifica !== prevProps.potVerifica &&
      pot.isError(potVerifica)
    ) {
      this.props.navigateToPaymentTransactionError(
        some(potVerifica.error),
        this.props.onRetry
      );
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
            this.props.resetPayment();
            this.props.navigation.goBack();
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
    title: I18n.t(
      pot.isSome(this.props.paymentId)
        ? "global.buttons.cancel"
        : "global.buttons.back"
    )
  });

  private renderFooterSingleButton() {
    return (
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={this.getSecondaryButtonProps()}
      />
    );
  }

  private renderFooterButtons() {
    const { potVerifica, maybeFavoriteWallet, hasWallets } = this.props;

    const primaryButtonProps =
      pot.isSome(potVerifica) &&
      !(pot.isLoading(potVerifica) || pot.isError(potVerifica))
        ? {
            ...basePrimaryButtonProps,
            disabled: false,
            onPress: () =>
              this.props.startOrResumePayment(
                potVerifica.value,
                maybeFavoriteWallet,
                hasWallets
              )
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

  public render(): React.ReactNode {
    const rptId = this.props.navigation.getParam("rptId");
    const initialAmount = this.props.navigation.getParam("initialAmount");

    // when empty, it means we're still loading the verifica response
    const { potVerifica } = this.props;

    const maybeEnteBeneficiario = pot
      .toOption(potVerifica)
      .mapNullable(_ => _.enteBeneficiario)
      .map(formatTextRecipient);

    return (
      <BaseScreenComponent
        goBack={this.handleBackPress}
        headerTitle={I18n.t("wallet.firstTransactionSummary.header")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <Content noPadded={true}>
          {pot.isSome(potVerifica) ? (
            <PaymentSummaryComponent
              hasVerificaResponse={true}
              amount={initialAmount}
              updatedAmount={
                potVerifica.value.importoSingoloVersamento
                  ? AmountToImporto.encode(
                      potVerifica.value.importoSingoloVersamento
                    )
                  : UNKNOWN_AMOUNT
              }
              paymentReason={
                potVerifica.value.causaleVersamento
                  ? cleanTransactionDescription(
                      potVerifica.value.causaleVersamento
                    )
                  : UNKNOWN_PAYMENT_REASON
              }
            />
          ) : (
            <PaymentSummaryComponent
              hasVerificaResponse={false}
              amount={initialAmount}
            />
          )}

          <View content={true}>
            {maybeEnteBeneficiario.isSome() && (
              <React.Fragment>
                <Text bold={true}>
                  {I18n.t("wallet.firstTransactionSummary.entity")}
                </Text>
                <Text>{maybeEnteBeneficiario.value.trim()}</Text>
                <View spacer={true} />
              </React.Fragment>
            )}

            <Text bold={true}>
              {I18n.t("wallet.firstTransactionSummary.object")}
            </Text>
            <Text>
              {pot
                .toOption(potVerifica)
                .mapNullable(_ => _.causaleVersamento)
                .getOrElse("...")}
            </Text>
            <View spacer={true} />
            <Text>
              <Text bold={true}>{`${I18n.t("payment.IUV")}: `}</Text>
              {PaymentNoticeNumberFromString.encode(rptId.paymentNoticeNumber)}
            </Text>
            <Text>
              <Text bold={true}>{`${I18n.t(
                "payment.recipientFiscalCode"
              )}: `}</Text>
              {rptId.organizationFiscalCode}
            </Text>
            <View spacer={true} />
          </View>
        </Content>

        {this.props.error.fold(
          this.renderFooterButtons(),
          error =>
            error === "PAYMENT_DUPLICATED"
              ? this.renderFooterSingleButton()
              : this.renderFooterButtons()
        )}
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const { verifica, attiva, paymentId, check, psps } = state.wallet.payment;
  const walletById = state.wallet.wallets.walletById;

  const maybeFavoriteWallet = pot.toOption(getFavoriteWallet(state));

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
        : pot.isError(check) || pot.isError(psps)
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
      pot.isNone(psps)) ||
    (maybeFavoriteWallet.isSome() && pot.isLoading(psps));

  const loadingCaption = isLoadingVerifica
    ? I18n.t("wallet.firstTransactionSummary.loadingMessage.verification")
    : isLoadingAttiva
      ? I18n.t("wallet.firstTransactionSummary.loadingMessage.activation")
      : isLoadingWalletById
        ? I18n.t("wallet.firstTransactionSummary.loadingMessage.wallet")
        : I18n.t("wallet.firstTransactionSummary.loadingMessage.generic");

  const hasWallets = pot.getOrElse(walletsSelector(state), []).length !== 0;

  return {
    error,
    isLoading,
    loadingCaption,
    loadingOpacity: 0.98,
    potVerifica: verifica,
    paymentId,
    maybeFavoriteWallet,
    hasWallets
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const rptId = props.navigation.getParam("rptId");
  const initialAmount = props.navigation.getParam("initialAmount");
  const isManualPaymentInsertion = props.navigation.getParam(
    "isManualPaymentInsertion"
  );

  const dispatchPaymentVerificaRequest = () =>
    dispatch(paymentVerifica.request(rptId));

  const resetPayment = () => {
    dispatch(runDeleteActivePaymentSaga());
    dispatch(paymentInitializeState());
  };

  const onCancel = () => {
    // on cancel:
    // navigate to entrypoint of payment or wallet home
    dispatch(backToEntrypointPayment());
    // delete the active payment from pagoPA
    dispatch(runDeleteActivePaymentSaga());
    // reset the payment state
    dispatch(paymentInitializeState());
  };

  // navigateToMessageDetail: (messageId: string) =>
  // dispatch(navigateToMessageDetailScreenAction({ messageId }))

  const startOrResumePayment = (
    verifica: PaymentRequestsGetResponse,
    maybeFavoriteWallet: ReturnType<
      typeof mapStateToProps
    >["maybeFavoriteWallet"],
    hasWallets: ReturnType<typeof mapStateToProps>["hasWallets"]
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
              dispatch(
                navigateToPaymentPickPaymentMethodScreen({
                  rptId,
                  initialAmount,
                  verifica,
                  idPayment
                })
              );
            },
            hasWallets
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
    >,
    onRetry: () => void
  ) =>
    dispatch(
      navigateToPaymentTransactionErrorScreen({
        error,
        onCancel,
        onRetry,
        rptId
      })
    );

  const dispatchNavigateToPaymentManualDataInsertion = () =>
    dispatch(
      navigateToPaymentManualDataInsertion({
        isInvalidAmount: isManualPaymentInsertion
      })
    );

  return {
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
    onRetryWithPotVerifica: (
      potVerifica: ReturnType<typeof mapStateToProps>["potVerifica"],
      maybeFavoriteWallet: ReturnType<
        typeof mapStateToProps
      >["maybeFavoriteWallet"],
      hasWallets: ReturnType<typeof mapStateToProps>["hasWallets"]
    ) => {
      if (pot.isSome(potVerifica)) {
        startOrResumePayment(
          potVerifica.value,
          maybeFavoriteWallet,
          hasWallets
        );
      } else {
        dispatchPaymentVerificaRequest();
      }
    },
    onDuplicatedPayment: () =>
      dispatch(
        paymentCompletedSuccess({
          rptId: props.navigation.getParam("rptId"),
          kind: "DUPLICATED"
        })
      )
  };
};

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: OwnProps
) => {
  const onRetry = () => {
    // If the error is INVALID_AMOUNT and the user has manually entered the data of notice
    // go back to the screen to allow the user to modify the data
    if (
      stateProps.error.toUndefined() === "INVALID_AMOUNT" &&
      dispatchProps.isManualPaymentInsertion
    ) {
      dispatchProps.dispatchNavigateToPaymentManualDataInsertion();
    } else {
      dispatchProps.onRetryWithPotVerifica(
        stateProps.potVerifica,
        stateProps.maybeFavoriteWallet,
        stateProps.hasWallets
      );
    }
  };
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    ...{
      onRetry
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withLoadingSpinner(TransactionSummaryScreen));
