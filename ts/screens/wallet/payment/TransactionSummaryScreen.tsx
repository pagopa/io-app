/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 * - "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */

import { none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  PaymentNoticeNumberFromString,
  RptId
} from "italia-ts-commons/lib/pagopa";
import { Body, Container, Content, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
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

import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestCancel,
  paymentRequestContinueWithPaymentMethods,
  paymentRequestGoBack
} from "../../../store/actions/wallet/payment";
import { createErrorSelector } from "../../../store/reducers/error";
import { createLoadingSelector } from "../../../store/reducers/loading";
import { GlobalState } from "../../../store/reducers/types";
import {
  getCurrentAmountFromGlobalStateWithVerificaResponse,
  getInitialAmountFromGlobalStateWithVerificaResponse,
  getPaymentContextCodeFromGlobalStateWithVerificaResponse,
  getPaymentReason,
  getPaymentRecipientFromGlobalStateWithVerificaResponse,
  getPaymentStep,
  getRptIdFromGlobalStateWithVerificaResponse,
  isGlobalStateWithVerificaResponse
} from "../../../store/reducers/wallet/payment";

import { mapErrorCodeToMessage } from "../../../types/errors";
import {
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_RECIPIENT
} from "../../../types/unknown";

type TransactionInfo = Readonly<{
  paymentReason: string;
  paymentRecipient: EnteBeneficiario;
  rptId: RptId;
  codiceContestoPagamento: CodiceContestoPagamento;
  amount: AmountInEuroCents;
  currentAmount: AmountInEuroCents;
}>;

type ReduxMappedStateProps = Readonly<{
  error: Option<string>;
  isLoading: boolean;
}> &
  (
    | Readonly<{
        valid: false;
      }>
    | Readonly<{
        valid: true;
        transactionInfo: Option<TransactionInfo>;
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

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

const formatMdRecipient = (e: EnteBeneficiario): string =>
  `**${I18n.t("wallet.firstTransactionSummary.entity")}**\n
${e.denominazioneBeneficiario} - ${e.denomUnitOperBeneficiario}\n
${e.indirizzoBeneficiario} n. ${e.civicoBeneficiario}\n
${e.capBeneficiario} ${e.localitaBeneficiario} (${e.provinciaBeneficiario})`;

const formatMdPaymentReason = (p: string): string =>
  `**${I18n.t("wallet.firstTransactionSummary.object")}**\n
${p}`;

const formatMdInfoRpt = (r: RptId): string =>
  `**${I18n.t("payment.IUV")}:** ${PaymentNoticeNumberFromString.encode(
    r.paymentNoticeNumber
  )}\n
**${I18n.t("payment.recipientFiscalCode")}:** ${r.organizationFiscalCode}`;

class TransactionSummaryScreen extends React.Component<Props, never> {
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

    // when empty, it means we're still loading the verifica response
    const txInfo = this.props.transactionInfo;

    const primaryButtonProps = {
      disabled: txInfo.isNone(),
      block: true,
      primary: true,
      onPress: txInfo.isSome()
        ? () =>
            this.props.confirmSummary(
              txInfo.value.rptId,
              txInfo.value.codiceContestoPagamento,
              txInfo.value.currentAmount
            )
        : undefined,
      title: I18n.t("wallet.continue")
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
          {txInfo.isSome() ? (
            <PaymentSummaryComponent
              navigation={this.props.navigation}
              hasVerificaResponse={true}
              amount={txInfo.value.amount}
              updatedAmount={txInfo.value.currentAmount}
              paymentReason={txInfo.value.paymentReason}
            />
          ) : (
            <PaymentSummaryComponent
              navigation={this.props.navigation}
              hasVerificaResponse={false}
            />
          )}

          <View content={true}>
            <Markdown>
              {txInfo
                .map(_ => formatMdRecipient(_.paymentRecipient))
                .getOrElse("...")}
            </Markdown>
            <View spacer={true} />
            <Markdown>
              {txInfo
                .map(_ => formatMdPaymentReason(_.paymentReason))
                .getOrElse("...")}
            </Markdown>
            <View spacer={true} />
            <Markdown>
              {txInfo.map(_ => formatMdInfoRpt(_.rptId)).getOrElse("...")}
            </Markdown>
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
  const paymentErrorSelector = createErrorSelector(["PAYMENT"]);
  const paymentLoadingSelector = createLoadingSelector(["PAYMENT"]);

  return (state: GlobalState): ReduxMappedStateProps => {
    if (
      (getPaymentStep(state) === "PaymentStateSummary" ||
        getPaymentStep(state) === "PaymentStateSummaryWithPaymentId") &&
      isGlobalStateWithVerificaResponse(state)
    ) {
      const transactionInfo = some({
        paymentReason: getPaymentReason(state).getOrElse(
          UNKNOWN_PAYMENT_REASON
        ), // could be undefined as per pagoPA type definition
        paymentRecipient: getPaymentRecipientFromGlobalStateWithVerificaResponse(
          state
        ).getOrElse(UNKNOWN_RECIPIENT), // could be undefined as per pagoPA type definition
        rptId: getRptIdFromGlobalStateWithVerificaResponse(state),
        codiceContestoPagamento: getPaymentContextCodeFromGlobalStateWithVerificaResponse(
          state
        ),
        amount: getInitialAmountFromGlobalStateWithVerificaResponse(state),
        currentAmount: getCurrentAmountFromGlobalStateWithVerificaResponse(
          state
        )
      });
      return {
        valid: true,
        error: paymentErrorSelector(state),
        isLoading: paymentLoadingSelector(state),
        transactionInfo
      };
    } else if (
      getPaymentStep(state) === "PaymentStateNoState" ||
      getPaymentStep(state) === "PaymentStateQrCode" ||
      getPaymentStep(state) === "PaymentStateManualEntry"
    ) {
      return {
        valid: true,
        error: paymentErrorSelector(state),
        isLoading: paymentLoadingSelector(state),
        transactionInfo: none
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
