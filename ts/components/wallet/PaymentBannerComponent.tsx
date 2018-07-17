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
import { Dispatch } from "../../store/actions/types";
import { showPaymentSummary } from "../../store/actions/wallet/payment";
import { GlobalState } from "../../store/reducers/types";
import {
  currentAmountSelector,
  paymentReasonSelector,
  paymentRecipientSelector
} from "../../store/reducers/wallet/payment";
import {
  UNKNOWN_AMOUNT,
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_RECIPIENT
} from "../../types/unknown";
import { amountBuilder } from "../../utils/stringBuilder";
import { WalletStyles } from "../styles/wallet";

type ReduxMappedStateProps = Readonly<{
  paymentReason: string;
  currentAmount: AmountInEuroCents;
  recipient: EnteBeneficiario;
}>;

type ReduxMappedDispatchProps = Readonly<{
  showPaymentSummary: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

class PaymentBannerComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <TouchableOpacity onPress={() => this.props.showPaymentSummary()}>
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
                {amountBuilder(
                  AmountInEuroCentsFromNumber.encode(this.props.currentAmount)
                )}
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

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  paymentReason: paymentReasonSelector(state).getOrElse(UNKNOWN_PAYMENT_REASON),
  currentAmount: currentAmountSelector(state).getOrElse(UNKNOWN_AMOUNT),
  recipient: paymentRecipientSelector(state).getOrElse(UNKNOWN_RECIPIENT)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  showPaymentSummary: () => dispatch(showPaymentSummary())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentBannerComponent);
