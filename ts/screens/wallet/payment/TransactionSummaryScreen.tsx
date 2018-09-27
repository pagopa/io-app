/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 * - "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */

import {
  PaymentNoticeNumberFromString,
  RptId
} from "italia-ts-commons/lib/pagopa";
import { Body, Container, Content, Left, Right, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { EnteBeneficiario } from "../../../../definitions/backend/EnteBeneficiario";
import GoBackButton from "../../../components/GoBackButton";
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
import { createLoadingSelector } from "../../../store/reducers/loading";
import { GlobalState } from "../../../store/reducers/types";
import {
  getPaymentReason,
  getPaymentRecipient,
  getPaymentStep,
  getRptId,
  isGlobalStateWithVerificaResponse
} from "../../../store/reducers/wallet/payment";
import {
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_RECIPIENT
} from "../../../types/unknown";

type ReduxMappedStateProps =
  | Readonly<{
      valid: false;
    }>
  | Readonly<{
      valid: true;
      paymentReason: string | undefined;
      paymentRecipient: EnteBeneficiario | undefined;
      rptId: RptId | undefined;
    }>;

type ReduxMappedDispatchProps = Readonly<{
  confirmSummary: () => void;
  goBack: () => void;
  cancelPayment: () => void;
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

    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: () => this.props.confirmSummary(),
      title: I18n.t("wallet.continue")
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      onPress: () => this.props.cancelPayment(),
      title: I18n.t("wallet.cancel")
    };

    const { paymentRecipient, paymentReason, rptId } = this.props;

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
          <PaymentSummaryComponent navigation={this.props.navigation} />
          <View content={true}>
            <Markdown>
              {paymentRecipient !== undefined
                ? formatMdRecipient(paymentRecipient)
                : "..."}
            </Markdown>
            <View spacer={true} />
            <Markdown>
              {paymentReason !== undefined
                ? formatMdPaymentReason(paymentReason)
                : "..."}
            </Markdown>
            <View spacer={true} />
            <Markdown>
              {rptId !== undefined ? formatMdInfoRpt(rptId) : "..."}
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

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps =>
  (getPaymentStep(state) === "PaymentStateSummary" ||
    getPaymentStep(state) === "PaymentStateSummaryWithPaymentId") &&
  isGlobalStateWithVerificaResponse(state)
    ? {
        valid: true,
        paymentReason: getPaymentReason(state).getOrElse(
          UNKNOWN_PAYMENT_REASON
        ), // could be undefined as per pagoPA type definition
        paymentRecipient: getPaymentRecipient(state).getOrElse(
          UNKNOWN_RECIPIENT
        ), // could be undefined as per pagoPA type definition
        rptId: getRptId(state)
      }
    : getPaymentStep(state) === "PaymentStateNoState" ||
      getPaymentStep(state) === "PaymentStateQrCode" ||
      getPaymentStep(state) === "PaymentStateManualEntry"
      ? {
          valid: true,
          paymentReason: undefined,
          paymentRecipient: undefined,
          rptId: undefined
        }
      : { valid: false };

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  confirmSummary: () => dispatch(paymentRequestContinueWithPaymentMethods()),
  goBack: () => dispatch(paymentRequestGoBack()),
  cancelPayment: () => dispatch(paymentRequestCancel())
});

export default withLoadingSpinner(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TransactionSummaryScreen),
  createLoadingSelector(["PAYMENT"]),
  {}
);
