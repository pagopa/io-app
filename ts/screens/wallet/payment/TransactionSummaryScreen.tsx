/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 * - "back" & "cancel" behavior to be implemented @https://www.pivotaltracker.com/story/show/159229087
 */

import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber,
  PaymentNoticeNumberFromString,
  RptId
} from "italia-ts-commons/lib/pagopa";
import {
  Body,
  Button,
  Container,
  Content,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { EnteBeneficiario } from "../../../../definitions/backend/EnteBeneficiario";
import AppHeader from "../../../components/ui/AppHeader";
import FooterButtons from "../../../components/ui/FooterButtons";
import IconFont from "../../../components/ui/IconFont";
import Markdown from "../../../components/ui/Markdown";
import PaymentSummaryComponent from "../../../components/wallet/PaymentSummaryComponent";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestContinueWithPaymentMethods,
  paymentRequestGoBack
} from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import {
  getCurrentAmount,
  getInitialAmount,
  getPaymentReason,
  getPaymentRecipient,
  getPaymentStep,
  getRptId,
  isGlobalStateWithVerificaResponse
} from "../../../store/reducers/wallet/payment";
import variables from "../../../theme/variables";
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
      initialAmount: AmountInEuroCents;
      currentAmount: AmountInEuroCents;
      paymentReason: string;
      paymentRecipient: EnteBeneficiario;
      rptId: RptId;
    }>;

type ReduxMappedDispatchProps = Readonly<{
  confirmSummary: () => void;
  goBack: () => void;
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
  `**IUV:** ${PaymentNoticeNumberFromString.encode(r.paymentNoticeNumber)}\n
**Recipient Fiscal Code:** ${r.organizationFiscalCode}`;

class TransactionSummaryScreen extends React.Component<Props, never> {
  constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }

    const amount = AmountInEuroCentsFromNumber.encode(this.props.initialAmount);
    const updatedAmount = AmountInEuroCentsFromNumber.encode(
      this.props.currentAmount
    );

    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: () => this.props.confirmSummary(),
      title: I18n.t("wallet.continue")
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      onPress: () => this.props.goBack(),
      title: I18n.t("wallet.cancel")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.props.goBack()}>
              <IconFont name="io-back" size={variables.iconSize3} />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.firstTransactionSummary.header")}</Text>
          </Body>
        </AppHeader>

        <Content noPadded={true}>
          <PaymentSummaryComponent
            navigation={this.props.navigation}
            amount={amount}
            updatedAmount={updatedAmount}
            paymentReason={this.props.paymentReason}
          />
          <View content={true}>
            <Markdown>
              {formatMdRecipient(this.props.paymentRecipient)}
            </Markdown>
            <View spacer={true} />
            <Markdown>
              {formatMdPaymentReason(this.props.paymentReason)}
            </Markdown>
            <View spacer={true} />
            <Markdown>{formatMdInfoRpt(this.props.rptId)}</Markdown>
            <View spacer={true} />
          </View>
        </Content>
        <FooterButtons
          leftButton={primaryButtonProps}
          rightButton={secondaryButtonProps}
          inlineHalf={true}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps =>
  getPaymentStep(state) === "PaymentStateSummary" &&
  isGlobalStateWithVerificaResponse(state)
    ? {
        valid: true,
        initialAmount: getInitialAmount(state),
        currentAmount: getCurrentAmount(state),
        paymentReason: getPaymentReason(state).getOrElse(
          UNKNOWN_PAYMENT_REASON
        ), // could be undefined as per pagoPA type definition
        paymentRecipient: getPaymentRecipient(state).getOrElse(
          UNKNOWN_RECIPIENT
        ), // could be undefined as per pagoPA type definition
        rptId: getRptId(state)
      }
    : { valid: false };

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  confirmSummary: () => dispatch(paymentRequestContinueWithPaymentMethods()),
  goBack: () => dispatch(paymentRequestGoBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionSummaryScreen);
