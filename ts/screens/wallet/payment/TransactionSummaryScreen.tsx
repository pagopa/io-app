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
  paymentRequestCancel,
  paymentRequestContinueWithPaymentMethods,
  paymentRequestGoBack,
  paymentVerificaRequest,
  runStartOrResumePaymentSaga
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { mapErrorCodeToMessage } from "../../../types/errors";
import { UNKNOWN_AMOUNT, UNKNOWN_PAYMENT_REASON } from "../../../types/unknown";
import { AmountToImporto } from "../../../utils/amounts";
import { Wallet } from "../../../types/pagopa";
import { Alert } from "react-native";
import { getFavoriteWallet } from "../../../store/reducers/wallet/wallets";
import { navigateToPaymentPickPaymentMethodScreen } from "../../../store/actions/navigation";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  maybePaymentId: Option<string>; // FIXME: find a way to pass this when navigating back
}>;

type ReduxMappedStateProps = Readonly<{
  error: Option<string>;
  isLoading: boolean;
  potVerifica: pot.Pot<PaymentRequestsGetResponse>;
  maybeFavoriteWallet: Option<Wallet>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  dispatchPaymentVerificaRequest: () => void;
  confirmSummary: (verifica: PaymentRequestsGetResponse) => void;
  goBack: () => void;
  cancelPayment: () => void;
  onCancel: () => void;
}>;

type Props = ReduxMappedStateProps &
  ReduxMappedDispatchProps &
  NavigationInjectedProps<NavigationParams>;

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
  public onComponentDidMount() {
    if (this.props.navigation.getParam("maybePaymentId").isNone()) {
      // on component mount, if we are not in a payment, trigger a request to
      // fetch the payment summary
      this.props.dispatchPaymentVerificaRequest();
    }
  }

  public render(): React.ReactNode {
    const rptId = this.props.navigation.getParam("rptId");
    const initialAmount = this.props.navigation.getParam("initialAmount");

    // when empty, it means we're still loading the verifica response
    const { potVerifica } = this.props;

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
            onPress: () => this.props.confirmSummary(potVerifica.value)
          }
        : {
            ...basePrimaryButtonProps,
            disabled: true
          };

    const secondaryButtonProps = {
      block: true,
      light: true,
      onPress: () => this.props.cancelPayment(),
      title: I18n.t("wallet.cancel")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton onPress={this.props.goBack} />
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
          inlineHalf={true}
        />
      </Container>
    );
  }
}

// TODO: Also add loading states for attiva, paymentid, check
const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  error: pot.isError(state.wallet.payment.verifica)
    ? some(state.wallet.payment.verifica.error.message)
    : none,
  isLoading: pot.isLoading(state.wallet.payment.verifica),
  potVerifica: state.wallet.payment.verifica,
  maybeFavoriteWallet: getFavoriteWallet(state)
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: Props
): ReduxMappedDispatchProps => {
  const rptId = props.navigation.getParam("rptId");
  const initialAmount = props.navigation.getParam("initialAmount");

  return {
    dispatchPaymentVerificaRequest: () =>
      dispatch(paymentVerificaRequest(rptId)),
    confirmSummary: (verifica: PaymentRequestsGetResponse) =>
      dispatch(
        runStartOrResumePaymentSaga({
          rptId,
          verifica,
          onSuccess: paymentId => {
            if (props.maybeFavoriteWallet.isSome()) {
              // confirm using the favorite wallet
              // ...confirmPaymentMethodHandler
            } else {
              // select a wallet
              dispatch(
                navigateToPaymentPickPaymentMethodScreen({
                  rptId,
                  initialAmount,
                  verifica,
                  paymentId
                })
              );
            }
          }
        })
      ),
    goBack: () => dispatch(paymentRequestGoBack()),
    cancelPayment: () => dispatch(paymentRequestCancel()),
    onCancel: () => dispatch(paymentRequestCancel())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withErrorModal(
    withLoadingSpinner(TransactionSummaryScreen, {}),
    mapErrorCodeToMessage
  )
);
