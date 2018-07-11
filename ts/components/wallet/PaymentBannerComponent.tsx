/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 * TODO: integrate with walletAPI
 *   @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
 */

import { Text, View } from "native-base";
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import I18n from "../../i18n";
import { WalletStyles } from "../styles/wallet";
import { AmountInEuroCentsFromNumber } from '../../screens/wallet/payment/TransactionSummaryScreen';
import { AmountInEuroCents } from 'italia-ts-commons/lib/pagopa';
import { GlobalState } from '../../store/reducers/types';
import { paymentReasonSelector, currentAmountSelector, paymentRecipientSelector } from '../../store/reducers/wallet/payment';
import { UNKNOWN_RECIPIENT } from '../../types/unknown';
import { EnteBeneficiario } from '../../../definitions/pagopa-proxy/EnteBeneficiario';
import { connect } from "react-redux";

type ReduxMappedProps = Readonly<{
  paymentReason: string, 
  currentAmount: AmountInEuroCents,
  recipient: EnteBeneficiario
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
  // paymentReason: string;
  // currentAmount: string;
  // entity: string;
}>;

type Props = OwnProps & ReduxMappedProps;

class PaymentBannerComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <Grid style={[WalletStyles.topContainer, WalletStyles.paddedLR]}>
        <Row>
          <Col>
            <View spacer={true} />
            <Text bold={true} style={WalletStyles.white}>
              {this.props.paymentReason}
            </Text>
          </Col>
          <Col>
            <View spacer={true} />
            <Text
              bold={true}
              style={[WalletStyles.white, WalletStyles.textRight]}
            >
              {`${AmountInEuroCentsFromNumber.encode(this.props.currentAmount)} €`}
            </Text>
          </Col>
        </Row>
        <Row>
          <Col>
            <Text style={WalletStyles.white}>{this.props.recipient.denominazioneBeneficiario}</Text>
            <View spacer={true} />
          </Col>
          <Col>
            <Text style={[WalletStyles.white, WalletStyles.textRight]}>
              {I18n.t("wallet.cancel").toUpperCase()}
            </Text>
            <View spacer={true} />
          </Col>
        </Row>
      </Grid>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  paymentReason: paymentReasonSelector(state).getOrElse(""), 
  currentAmount: currentAmountSelector(state).getOrElse("0000000000" as AmountInEuroCents),
  recipient: paymentRecipientSelector(state).getOrElse(UNKNOWN_RECIPIENT)
});

export default connect(mapStateToProps)(PaymentBannerComponent);