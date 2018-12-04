/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 */

import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber
} from "italia-pagopa-commons/lib/pagopa";
import { Button, Right, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";

import { EnteBeneficiario } from "../../../definitions/backend/EnteBeneficiario";
import I18n from "../../i18n";
import { formatNumberAmount } from "../../utils/stringBuilder";
import { WalletStyles } from "../styles/wallet";

const styles = StyleSheet.create({
  rightButtonText: {
    paddingRight: 0
  }
});

type Props = Readonly<{
  paymentReason: string;
  currentAmount: AmountInEuroCents;
  recipient: EnteBeneficiario;
  onCancel: () => void;
}>;

const PaymentBannerComponent: React.SFC<Props> = props => {
  const currentAmount = formatNumberAmount(
    AmountInEuroCentsFromNumber.encode(props.currentAmount)
  );

  return (
    <Grid style={[WalletStyles.topContainer, WalletStyles.paddedLR]}>
      <Row>
        <Col size={2}>
          <View spacer={true} />
          <Text bold={true} style={WalletStyles.white}>
            {props.paymentReason}
          </Text>
        </Col>
        <Col size={1}>
          <View spacer={true} />
          <Text
            bold={true}
            style={[WalletStyles.white, WalletStyles.textRight]}
          >
            {currentAmount}
          </Text>
        </Col>
      </Row>
      <Row>
        <Col size={2}>
          <Text style={WalletStyles.white}>
            {props.recipient.denominazioneBeneficiario}
          </Text>
          <View spacer={true} />
        </Col>
        <Right>
          <Button small={true} transparent={true} onPress={props.onCancel}>
            <Text style={[WalletStyles.white, styles.rightButtonText]}>
              {I18n.t("global.buttons.cancel").toUpperCase()}
            </Text>
          </Button>
          <View spacer={true} />
        </Right>
      </Row>
    </Grid>
  );
};

export default PaymentBannerComponent;
