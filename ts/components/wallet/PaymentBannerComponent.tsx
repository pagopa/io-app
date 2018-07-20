/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 * TODO: integrate with walletAPI
 *   @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
 */

import { AmountInEuroCentsFromNumber } from "italia-ts-commons/lib/pagopa";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { Text, View } from "native-base";
import * as React from "react";
import { TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { EnteBeneficiario } from "../../../definitions/backend/EnteBeneficiario";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import {
  getCurrentAmount,
  getPaymentReason,
  getPaymentRecipient,
  isGlobalStateWithSelectedPaymentMethod
} from "../../store/reducers/wallet/payment";
import { UNKNOWN_PAYMENT_REASON, UNKNOWN_RECIPIENT } from "../../types/unknown";
import { amountBuilder } from "../../utils/stringBuilder";
import { WalletStyles } from "../styles/wallet";

type ReduxMappedStateProps =
  | Readonly<{
      valid: true;
      paymentReason: string;
      currentAmount: AmountInEuroCents;
      recipient: EnteBeneficiario;
    }>
  | Readonly<{
      valid: false;
    }>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps;

class PaymentBannerComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }
    const amount = amountBuilder(
      AmountInEuroCentsFromNumber.encode(this.props.currentAmount)
    );

    return (
      // TODO: tapping on this TouchableOpacity should return the navigation
      // to the "payment summary" screen
      <TouchableOpacity>
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
                {amount}
              </Text>
            </Col>
          </Row>
          <Row>
            <Col>
              <Text style={WalletStyles.white}>
                {this.props.recipient.denominazioneBeneficiario}
              </Text>
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
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps =>
  isGlobalStateWithSelectedPaymentMethod(state)
    ? {
        valid: true,
        paymentReason: getPaymentReason(state).getOrElse(
          UNKNOWN_PAYMENT_REASON
        ), // this could be empty as per pagoPA definition
        currentAmount: getCurrentAmount(state),
        recipient: getPaymentRecipient(state).getOrElse(UNKNOWN_RECIPIENT) // this could be empty as per pagoPA definition
      }
    : { valid: false };

export default connect(mapStateToProps)(PaymentBannerComponent);
