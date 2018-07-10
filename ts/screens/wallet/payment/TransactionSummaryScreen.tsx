/**
 * This screen shows the transaction details.
 * It should occur after the transaction identification by qr scanner or manual procedure.
 * TODO:
 * - integrate contextual help
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 * - check availability of displayed data. Define optional data and implement their rendering as preferred
 */

import {
  Body,
  Button,
  Container,
  Content,
  H1,
  H3,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletAPI } from "../../../api/wallet/wallet-api";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import IconFont from "../../../components/ui/IconFont";
import PaymentSummaryComponent from "../../../components/wallet/PaymentSummaryComponent";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import {
  NotifiedTransaction
} from "../../../types/wallet";
import Markdown from '../../../components/ui/Markdown';
import { EnteBeneficiario } from '../../../../definitions/pagopa-proxy/EnteBeneficiario';
import { paymentRecipientSelector, paymentReasonSelector, getRptId, getInitialAmount, currentAmountSelector } from '../../../store/reducers/wallet/payment';
import { UNKNOWN_RECIPIENT, UNKNOWN_RPTID } from '../../../types/unknown';
import { GlobalState } from '../../../store/reducers/types';
import { connect } from 'react-redux';
import { RptId, PaymentNoticeNumberFromString, AmountInEuroCents } from '../../../../node_modules/italia-ts-commons/lib/pagopa';

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

const styles = StyleSheet.create({
  padded: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  }
});

const transactionDetails: Readonly<
  NotifiedTransaction
> = WalletAPI.getNotifiedTransaction();

///////////////////// to be removed when italia-ts-commons is updated
import * as t from "io-ts";
import { Dispatch } from '../../../store/actions/types';
import { confirmSummary } from '../../../store/actions/wallet/payment';
export const MAX_AMOUNT_DIGITS = 10;
export const CENTS_IN_ONE_EURO = 100;
export type AmountInEuroCents = t.TypeOf<typeof AmountInEuroCents>;

export const AmountInEuroCentsFromNumber = new t.Type<
  AmountInEuroCents,
  number,
  number
>(
  "AmountInEuroCentsFromNumber",
  AmountInEuroCents.is,
  (i, c) =>
    AmountInEuroCents.validate(
      `${"0".repeat(MAX_AMOUNT_DIGITS)}${Math.floor(
        i * CENTS_IN_ONE_EURO
      )}`.slice(-MAX_AMOUNT_DIGITS),
      c
    ),
  a => parseInt(a, 10) / CENTS_IN_ONE_EURO
);
//////////////////

const formatMdRecipient = (e: EnteBeneficiario): React.ReactNode => (
  <Markdown>{`
  **${I18n.t("wallet.firstTransactionSummary.entity")}**\n
  ${e.denominazioneBeneficiario} - ${e.denomUnitOperBeneficiario}\n
  ${e.indirizzoBeneficiario} n. ${e.civicoBeneficiario}\n
  ${e.capBeneficiario} ${e.localitaBeneficiario} (${e.provinciaBeneficiario})
  `}
  </Markdown>
);

const formatMdPaymentReason = (p: string): React.ReactNode => (
  <Markdown>{`
  **${I18n.t("wallet.firstTransactionSummary.object")}**\n
  ${p}
  `}
  </Markdown>
);

const formatMdInfoRpt = (r: RptId): React.ReactNode => (
  <Markdown>{`
  **IUV:** ${PaymentNoticeNumberFromString.encode(r.paymentNoticeNumber)}\n
  **Recipient Fiscal Code:** ${ r.organizationFiscalCode}`}
  </Markdown>
);

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
          <Grid style={[styles.padded, WalletStyles.backContent]}>
            <Row>
              <Col size={5}>
                <View spacer={true} large={true} />
                <H3 style={WalletStyles.white}>
                  {I18n.t("wallet.firstTransactionSummary.title")}
                </H3>
                <H1 style={WalletStyles.white}>
                  {transactionDetails.paymentReason}
                </H1>
              </Col>
              <Col size={1}>
                <View spacer={true} large={true} />
                <Image
                  source={require("../../../../img/wallet/icon-avviso-pagopa.png")}
                />
              </Col>
            </Row>
            <View spacer={true} large={true} />
          </Grid>

          <PaymentSummaryComponent
            navigation={this.props.navigation}
            amount={`${AmountInEuroCentsFromNumber.encode(this.props.originalAmount)}`}
            updatedAmount={`${AmountInEuroCentsFromNumber.encode(this.props.updatedAmount)}`}
          />

          <Grid style={[styles.padded, WalletStyles.backContent]}>
            <Row>
              <H3 style={WalletStyles.white}>
                {I18n.t("wallet.firstTransactionSummary.expireDate")}
              </H3>
              <Right>
                <H1 style={WalletStyles.white}>
                  {transactionDetails.expireDate.toLocaleDateString()}
                </H1>
              </Right>
            </Row>
            <View spacer={true} />
            <Row>
              <H3 style={WalletStyles.white}>
                {I18n.t("wallet.firstTransactionSummary.tranche")}
              </H3>
              <Right>
                <H1 style={WalletStyles.white}>{transactionDetails.tranche}</H1>
              </Right>
            </Row>
            <View spacer={true} large={true} />
          </Grid>
          {formatMdRecipient(this.props.paymentRecipient)}
          {formatMdPaymentReason(this.props.paymentReason)}
          {formatMdInfoRpt(this.props.rptId)}
          <View spacer={true}/>
        </Content>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={() => this.props.confirmSummary()}>
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
  paymentRecipient: paymentRecipientSelector(state).getOrElse(UNKNOWN_RECIPIENT),
  paymentReason: paymentReasonSelector(state).getOrElse(""),
  rptId: getRptId(state).getOrElse(UNKNOWN_RPTID),
  originalAmount: getInitialAmount(state).getOrElse("0000000000" as AmountInEuroCents),
  updatedAmount: currentAmountSelector(state).getOrElse("0000000000" as AmountInEuroCents)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  confirmSummary: () => dispatch(confirmSummary())
});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSummaryScreen);