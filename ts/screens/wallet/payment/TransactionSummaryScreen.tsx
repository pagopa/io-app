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

import { CodiceContestoPagamento } from "../../../../definitions/backend/CodiceContestoPagamento";
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
  paymentRequestGoBack
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { getPaymentState } from "../../../store/reducers/wallet/payment";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { mapErrorCodeToMessage } from "../../../types/errors";
import { UNKNOWN_AMOUNT, UNKNOWN_PAYMENT_REASON } from "../../../types/unknown";
import { AmountToImporto } from "../../../utils/amounts";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
}>;

type ReduxMappedStateProps = Readonly<{
  error: Option<string>;
  isLoading: boolean;
}> &
  (
    | Readonly<{
        valid: false; // TODO: replace valid: false with an error
      }>
    | Readonly<{
        valid: true;
        potVerifica: pot.Pot<PaymentRequestsGetResponse>;
      }>);

type ReduxMappedDispatchProps = Readonly<{
  confirmSummary: (
    rptId: RptId,
    codiceContestoPagamento: CodiceContestoPagamento,
    currentAmount: AmountInEuroCents
  ) => void;
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
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    // avoids updating the component on invalid props to avoid having the screen
    // become blank during transitions from one payment state to another
    // FIXME: this is quite fragile, we should instead avoid having a shared state
    return nextProps.valid;
  }

  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }

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
            onPress: () =>
              this.props.confirmSummary(
                rptId,
                potVerifica.value.codiceContestoPagamento,
                AmountToImporto.encode(
                  potVerifica.value.importoSingoloVersamento
                )
              )
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

function mapStateToProps() {
  return (state: GlobalState): ReduxMappedStateProps => {
    const maybePaymentState = getPaymentState(state);
    if (maybePaymentState.isNone()) {
      // we're not in a payment
      return {
        valid: false,
        error: none,
        isLoading: false
      };
    }
    const paymentState = maybePaymentState.value;
    if (paymentState.kind === "PaymentStateSummary") {
      const potVerificaResponse = paymentState.verificaResponse;
      return {
        valid: true,
        error: pot.isError(potVerificaResponse)
          ? some(potVerificaResponse.error.message)
          : none,
        isLoading: pot.isLoading(potVerificaResponse),
        potVerifica: paymentState.verificaResponse
      };
    } else if (paymentState.kind === "PaymentStateSummaryWithPaymentId") {
      return {
        valid: true,
        error: none,
        isLoading: false,
        potVerifica: pot.some(paymentState.verificaResponse)
      };
    } else {
      return {
        valid: false,
        error: none,
        isLoading: false
      };
    }
  };
}
const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  confirmSummary: (
    rptId: RptId,
    codiceContestoPagamento: CodiceContestoPagamento,
    currentAmount: AmountInEuroCents
  ) =>
    dispatch(
      paymentRequestContinueWithPaymentMethods({
        rptId,
        codiceContestoPagamento,
        currentAmount
      })
    ),
  goBack: () => dispatch(paymentRequestGoBack()),
  cancelPayment: () => dispatch(paymentRequestCancel()),
  onCancel: () => dispatch(paymentRequestCancel())
});

export default connect(
  mapStateToProps(),
  mapDispatchToProps
)(
  withErrorModal(
    withLoadingSpinner(TransactionSummaryScreen, {}),
    mapErrorCodeToMessage
  )
);
