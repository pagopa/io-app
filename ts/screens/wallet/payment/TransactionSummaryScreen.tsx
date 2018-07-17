/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 * - check availability of displayed data. Define optional data and implement their rendering as preferred
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
import IconFont from "../../../components/ui/IconFont";
import Markdown from "../../../components/ui/Markdown";
import PaymentSummaryComponent from "../../../components/wallet/PaymentSummaryComponent";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { confirmSummary } from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import {
  currentAmountSelector,
  getInitialAmount,
  getRptId,
  paymentReasonSelector,
  paymentRecipientSelector
} from "../../../store/reducers/wallet/payment";
import variables from "../../../theme/variables";
import {
  UNKNOWN_AMOUNT,
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_RECIPIENT,
  UNKNOWN_RPTID
} from "../../../types/unknown";

type ReduxMappedStateProps = Readonly<{
  paymentRecipient: EnteBeneficiario;
  paymentReason: string;
  rptId: RptId;
  originalAmount: AmountInEuroCents;
  updatedAmount: AmountInEuroCents;
}>;

type ReduxMappedDispatchProps = Readonly<{
  confirmSummary: () => void;
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

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
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
            amount={AmountInEuroCentsFromNumber.encode(
              this.props.originalAmount
            )}
            updatedAmount={AmountInEuroCentsFromNumber.encode(
              this.props.updatedAmount
            )}
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
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={() => this.props.confirmSummary()}
          >
            <Text>{I18n.t("wallet.continue")}</Text>
          </Button>
          <View spacer={true} />
          <Button block={true} light={true} onPress={(): void => this.goBack()}>
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  paymentRecipient: paymentRecipientSelector(state).getOrElse(
    UNKNOWN_RECIPIENT
  ),
  paymentReason: paymentReasonSelector(state).getOrElse(UNKNOWN_PAYMENT_REASON),
  rptId: getRptId(state).getOrElse(UNKNOWN_RPTID),
  originalAmount: getInitialAmount(state).getOrElse(UNKNOWN_AMOUNT),
  updatedAmount: currentAmountSelector(state).getOrElse(UNKNOWN_AMOUNT)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  confirmSummary: () => dispatch(confirmSummary())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionSummaryScreen);
