/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 * - "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */

import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  PaymentNoticeNumberFromString,
  RptId
} from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { EnteBeneficiario } from "../../../../definitions/backend/EnteBeneficiario";

import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import PaymentSummaryComponent from "../../../components/wallet/PaymentSummaryComponent";

import I18n from "../../../i18n";

import { Dispatch } from "../../../store/actions/types";
import {
  paymentAttiva,
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentInitializeState,
  paymentVerifica,
  runDeleteActivePaymentSaga,
  runStartOrResumePaymentActivationSaga
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";

import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentTransactionErrorScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { getFavoriteWallet } from "../../../store/reducers/wallet/wallets";
import { UNKNOWN_AMOUNT, UNKNOWN_PAYMENT_REASON } from "../../../types/unknown";
import { PayloadForAction } from "../../../types/utils";
import { AmountToImporto } from "../../../utils/amounts";
import { cleanTransactionDescription } from "../../../utils/payment";
import { dispatchPickPspOrConfirm } from "./common";

const basePrimaryButtonProps = {
  block: true,
  primary: true,
  title: I18n.t("wallet.continue")
};

export type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
}>;

type ReduxMergedProps = Readonly<{
  onRetry?: () => void;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxMergedProps &
  OwnProps;

const formatMdRecipient = (e: EnteBeneficiario): string => {
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

  return `**${I18n.t("wallet.firstTransactionSummary.entity")}**\n
${e.denominazioneBeneficiario}${denomUnitOper}\n
${address}${civicNumber}\n
${cap}${city}${province}`;
};

const formatMdPaymentReason = (p: string): string =>
  `**${I18n.t("wallet.firstTransactionSummary.object")}**\n
${cleanTransactionDescription(p)}`;

const formatMdInfoRpt = (r: RptId): string =>
  `**${I18n.t("payment.IUV")}:** ${PaymentNoticeNumberFromString.encode(
    r.paymentNoticeNumber
  )}\n
**${I18n.t("payment.recipientFiscalCode")}:** ${r.organizationFiscalCode}`;

class TransactionSummaryScreen extends React.Component<Props> {
  public componentDidMount() {
    if (pot.isNone(this.props.potVerifica)) {
      // on component mount, fetch the payment summary if we haven't already
      this.props.dispatchPaymentVerificaRequest();
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { error } = this.props;
    // in case the verifica returns an error indicating the payment has been
    // already completed for this notice, we update the payment state so that
    // the notice result paid
    if (error.toUndefined() !== prevProps.error.toUndefined()) {
      error
        .filter(_ => _ === "PAYMENT_DUPLICATED")
        .map(_ => this.props.onDuplicatedPayment());
      if (error.isSome()) {
        this.props.navigateToPaymentTransactionError(error);
      }
    }
  }

  private handleBackPress = () => this.props.navigation.goBack();

  private getSecondaryButtonProps = () => ({
    block: true,
    light: true,
    onPress: this.handleBackPress,
    title: I18n.t("global.buttons.back")
  });

  private renderFooterSingleButton() {
    return (
      <FooterWithButtons
        type="SingleButton"
        leftButton={this.getSecondaryButtonProps()}
      />
    );
  }

  private renderFooterButtons() {
    const { potVerifica, maybeFavoriteWallet } = this.props;

    const primaryButtonProps =
      pot.isSome(potVerifica) &&
      !(pot.isLoading(potVerifica) || pot.isError(potVerifica))
        ? {
            ...basePrimaryButtonProps,
            disabled: false,
            onPress: () =>
              this.props.startOrResumePayment(
                potVerifica.value,
                maybeFavoriteWallet
              )
          }
        : {
            ...basePrimaryButtonProps,
            disabled: true
          };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
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

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.firstTransactionSummary.header")}
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
            <Markdown>
              {pot
                .toOption(potVerifica)
                .mapNullable(_ => _.enteBeneficiario)
                .map(formatMdRecipient)
                .getOrElse("...")}
            </Markdown>
            <View spacer={true} />
            <Markdown>
              {pot
                .toOption(potVerifica)
                .mapNullable(_ => _.causaleVersamento)
                .map(formatMdPaymentReason)
                .getOrElse("...")}
            </Markdown>
            <View spacer={true} />
            <Markdown>{formatMdInfoRpt(rptId)}</Markdown>
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
  const isLoading =
    pot.isLoading(verifica) ||
    pot.isLoading(attiva) ||
    (error.isNone() && pot.isSome(attiva) && pot.isNone(paymentId)) ||
    pot.isLoading(paymentId) ||
    (error.isNone() && pot.isSome(paymentId) && pot.isNone(check)) ||
    pot.isLoading(check) ||
    (maybeFavoriteWallet.isSome() &&
      error.isNone() &&
      pot.isSome(check) &&
      pot.isNone(psps)) ||
    (maybeFavoriteWallet.isSome() && pot.isLoading(psps));

  return {
    error,
    // TODO: show different loading messages for each loading state
    isLoading,
    potVerifica: verifica,
    maybeFavoriteWallet
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const rptId = props.navigation.getParam("rptId");
  const initialAmount = props.navigation.getParam("initialAmount");

  const dispatchPaymentVerificaRequest = () =>
    dispatch(paymentVerifica.request(rptId));

  const navigateToPaymentTransactionError = (
    error: Option<
      PayloadForAction<
        | typeof paymentVerifica["failure"]
        | typeof paymentAttiva["failure"]
        | typeof paymentIdPolling["failure"]
      >
    >
  ) => dispatch(navigateToPaymentTransactionErrorScreen({ error }));

  // navigateToMessageDetail: (messageId: string) =>
  // dispatch(navigateToMessageDetailScreenAction({ messageId }))

  const startOrResumePayment = (
    verifica: PaymentRequestsGetResponse,
    maybeFavoriteWallet: ReturnType<
      typeof mapStateToProps
    >["maybeFavoriteWallet"]
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
            }
          )
      })
    );

  return {
    dispatchPaymentVerificaRequest,
    navigateToPaymentTransactionError,
    startOrResumePayment,
    goBack: () => {
      props.navigation.goBack();
      // reset the payment state
      dispatch(paymentInitializeState());
    },
    onCancel: () => {
      // on cancel:
      // navigate to the wallet home
      dispatch(navigateToWalletHome());
      // delete the active payment from PagoPA
      dispatch(runDeleteActivePaymentSaga());
      // reset the payment state
      dispatch(paymentInitializeState());
    },
    onRetryWithPotVerifica: (
      potVerifica: ReturnType<typeof mapStateToProps>["potVerifica"],
      maybeFavoriteWallet: ReturnType<
        typeof mapStateToProps
      >["maybeFavoriteWallet"]
    ) => {
      if (pot.isSome(potVerifica)) {
        startOrResumePayment(potVerifica.value, maybeFavoriteWallet);
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
  ownProps: {}
) => {
  // we allow to retry the operation on a temporary unavailability of the remote
  // system, a timeout while waiting for the payment ID and for generic errors
  // (e.g. timeouts)
  const canRetry = stateProps.error
    .filter(
      _ =>
        _ === "PAYMENT_UNAVAILABLE" ||
        _ === "PAYMENT_ID_TIMEOUT" ||
        _ === undefined
    )
    .isSome();
  const baseProps = {
    ...stateProps,
    ...dispatchProps,
    ...ownProps
  };
  return canRetry
    ? {
        ...baseProps,
        onRetry: () =>
          dispatchProps.onRetryWithPotVerifica(
            stateProps.potVerifica,
            stateProps.maybeFavoriteWallet
          )
      }
    : baseProps;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withLoadingSpinner(TransactionSummaryScreen));
