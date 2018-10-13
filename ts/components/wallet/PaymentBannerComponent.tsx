/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 */

import { AmountInEuroCentsFromNumber } from "italia-ts-commons/lib/pagopa";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { Text, View } from "native-base";
import * as React from "react";
import { TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { connect } from "react-redux";
import { EnteBeneficiario } from "../../../definitions/backend/EnteBeneficiario";
import I18n from "../../i18n";
import { Dispatch } from "../../store/actions/types";
import { paymentRequestTransactionSummaryFromBanner } from "../../store/actions/wallet/payment";
import { GlobalState } from "../../store/reducers/types";
import {
  getCurrentAmountFromGlobalStateWithVerificaResponse,
  getPaymentReason,
  getPaymentRecipientFromGlobalStateWithVerificaResponse,
  isGlobalStateWithVerificaResponse
} from "../../store/reducers/wallet/payment";
import { UNKNOWN_PAYMENT_REASON, UNKNOWN_RECIPIENT } from "../../types/unknown";
import { buildAmount } from "../../utils/stringBuilder";
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

type ReduxMappedDispatchProps = Readonly<{
  showSummary: () => void;
}>;

type Props = ReduxMappedStateProps & ReduxMappedDispatchProps;

class PaymentBannerComponent extends React.Component<Props> {
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
    const amount = buildAmount(
      AmountInEuroCentsFromNumber.encode(this.props.currentAmount)
    );

    return (
      <TouchableOpacity onPress={() => this.props.showSummary()}>
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
  isGlobalStateWithVerificaResponse(state)
    ? {
        valid: true,
        paymentReason: getPaymentReason(state).getOrElse(
          UNKNOWN_PAYMENT_REASON
        ), // this could be empty as per pagoPA definition
        currentAmount: getCurrentAmountFromGlobalStateWithVerificaResponse(
          state
        ),
        recipient: getPaymentRecipientFromGlobalStateWithVerificaResponse(
          state
        ).getOrElse(UNKNOWN_RECIPIENT) // this could be empty as per pagoPA definition
      }
    : { valid: false };

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  showSummary: () => dispatch(paymentRequestTransactionSummaryFromBanner())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentBannerComponent);
