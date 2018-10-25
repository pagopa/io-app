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
} from "italia-ts-commons/lib/pagopa";
import { Body, Container, Content, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { EnteBeneficiario } from "../../../../definitions/backend/EnteBeneficiario";

import GoBackButton from "../../../components/GoBackButton";
import { withErrorModal } from "../../../components/helpers/withErrorModal";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import { InstabugButtons } from "../../../components/InstabugButtons";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import PaymentSummaryComponent from "../../../components/wallet/PaymentSummaryComponent";

import I18n from "../../../i18n";

import * as pot from "../../../types/pot";

import { Dispatch } from "../../../store/actions/types";
import {
  paymentVerificaRequest,
  runStartOrResumePaymentSaga
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  navigateToPaymentConfirmPaymentMethodScreen,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { getFavoriteWallet } from "../../../store/reducers/wallet/wallets";
import { Wallet } from "../../../types/pagopa";
import { UNKNOWN_AMOUNT, UNKNOWN_PAYMENT_REASON } from "../../../types/unknown";
import { AmountToImporto } from "../../../utils/amounts";
import { shouldSelectPspForWallet } from "../../../utils/payment";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
}>;

type ReduxMappedStateProps = Readonly<{
  error: Option<
    | pot.PotErrorType<GlobalState["wallet"]["payment"]["verifica"]>
    | "PAYMENT_ID_TIMEOUT"
  >;
  isLoading: boolean;
  potVerifica: GlobalState["wallet"]["payment"]["verifica"];
  maybeFavoriteWallet: Option<Wallet>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  dispatchPaymentVerificaRequest: () => void;
  startOrResumePayment: (
    verifica: PaymentRequestsGetResponse,
    maybeFavoriteWallet: ReduxMappedStateProps["maybeFavoriteWallet"]
  ) => void;
  goBack: () => void;
  onCancel: () => void;
  onRetryWithPotVerifica: (
    potVerifica: ReduxMappedStateProps["potVerifica"],
    maybeFavoriteWallet: ReduxMappedStateProps["maybeFavoriteWallet"]
  ) => void;
}>;

type ReduxMergedProps = Readonly<{
  onRetry: () => void;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReduxMappedStateProps &
  ReduxMappedDispatchProps &
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
${p}`;

const formatMdInfoRpt = (r: RptId): string =>
  `**${I18n.t("payment.IUV")}:** ${PaymentNoticeNumberFromString.encode(
    r.paymentNoticeNumber
  )}\n
**${I18n.t("payment.recipientFiscalCode")}:** ${r.organizationFiscalCode}`;

class TransactionSummaryScreen extends React.Component<Props> {
  public componentDidMount() {
    if (pot.isNone(this.props.potVerifica)) {
      // on component mount, if we haven't fetch the payment summary if we
      // haven't already
      this.props.dispatchPaymentVerificaRequest();
    }
  }

  public render(): React.ReactNode {
    const rptId = this.props.navigation.getParam("rptId");
    const initialAmount = this.props.navigation.getParam("initialAmount");

    // when empty, it means we're still loading the verifica response
    const { potVerifica, maybeFavoriteWallet } = this.props;

    const basePrimaryButtonProps = {
      block: true,
      primary: true,
      title: I18n.t("wallet.continue")
    };
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

    const secondaryButtonProps = {
      block: true,
      light: true,
      onPress: () => this.props.navigation.goBack(),
      title: I18n.t("global.buttons.back")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            <Text>{I18n.t("wallet.firstTransactionSummary.header")}</Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>

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
                potVerifica.value.causaleVersamento || UNKNOWN_PAYMENT_REASON
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
        <FooterWithButtons
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonProps}
          inlineOneThird={true}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => {
  const { verifica, attiva, paymentId, check, psps } = state.wallet.payment;
  return {
    error: pot.isError(verifica)
      ? some(verifica.error)
      : pot.isError(attiva)
        ? some(attiva.error)
        : pot.isError(paymentId)
          ? some(paymentId.error)
          : pot.isError(check)
            ? some(undefined)
            : pot.isError(psps)
              ? some(undefined)
              : none,
    // TODO: show different loading messages for each loading state
    isLoading:
      pot.isLoading(verifica) ||
      pot.isLoading(attiva) ||
      pot.isLoading(paymentId) ||
      pot.isLoading(check) ||
      pot.isLoading(psps),
    potVerifica: verifica,
    maybeFavoriteWallet: getFavoriteWallet(state)
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: OwnProps
): ReduxMappedDispatchProps => {
  const rptId = props.navigation.getParam("rptId");
  const initialAmount = props.navigation.getParam("initialAmount");

  const dispatchPaymentVerificaRequest = () =>
    dispatch(paymentVerificaRequest(rptId));

  const startOrResumePayment = (
    verifica: PaymentRequestsGetResponse,
    maybeFavoriteWallet: ReduxMappedStateProps["maybeFavoriteWallet"]
  ) =>
    dispatch(
      runStartOrResumePaymentSaga({
        rptId,
        verifica,
        onSuccess: (paymentId, psps) => {
          // payment has been activated successfully
          if (maybeFavoriteWallet.isSome()) {
            // the user has selected a favorite wallet, so no need to ask to
            // select one
            const wallet = maybeFavoriteWallet.value;
            if (shouldSelectPspForWallet(wallet, psps)) {
              // there are multiple psps available for the favorite wallet,
              // as the user to select one
              dispatch(
                navigateToPaymentPickPspScreen({
                  rptId,
                  initialAmount,
                  verifica,
                  wallet,
                  psps,
                  paymentId
                })
              );
            } else {
              // there is only one psp available or the user already selected
              // a psp in the past for this wallet that can be used for this
              // payment, in this case we can proceed to the confirmation
              // screen
              dispatch(
                navigateToPaymentConfirmPaymentMethodScreen({
                  rptId,
                  initialAmount,
                  verifica,
                  paymentId,
                  psps,
                  wallet: maybeFavoriteWallet.value
                })
              );
            }
          } else {
            // select a wallet
            dispatch(
              navigateToPaymentPickPaymentMethodScreen({
                rptId,
                initialAmount,
                verifica,
                paymentId,
                psps
              })
            );
          }
        }
      })
    );

  return {
    dispatchPaymentVerificaRequest,
    startOrResumePayment,
    goBack: () => props.navigation.goBack(),
    onCancel: () => dispatch(navigateToWalletHome()),
    onRetryWithPotVerifica: (
      potVerifica: ReduxMappedStateProps["potVerifica"],
      maybeFavoriteWallet: ReduxMappedStateProps["maybeFavoriteWallet"]
    ) => {
      if (pot.isSome(potVerifica)) {
        startOrResumePayment(potVerifica.value, maybeFavoriteWallet);
      } else {
        dispatchPaymentVerificaRequest();
      }
    }
  };
};

const mergeProps = (
  stateProps: ReduxMappedStateProps,
  dispatchProps: ReduxMappedDispatchProps,
  ownProps: {}
) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  ...{
    onRetry: () =>
      dispatchProps.onRetryWithPotVerifica(
        stateProps.potVerifica,
        stateProps.maybeFavoriteWallet
      )
  }
});

const mapErrorCodeToMessage = (
  error: ReduxMappedStateProps["error"]["_A"]
): string => {
  switch (error) {
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
    case undefined:
      return I18n.t("wallet.errors.GENERIC_ERROR");
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(
  withErrorModal(
    withLoadingSpinner(TransactionSummaryScreen),
    mapErrorCodeToMessage
  )
);
