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
import variables from "../../theme/variables";
import { formatNumberAmount } from "../../utils/stringBuilder";

const styles = StyleSheet.create({
  rightButtonText: {
    paddingRight: 0
  },

  topContainer: {
    backgroundColor: variables.brandDarkGray
  },

  paddedLR: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },

  textRight: {
    textAlign: "right"
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
    <Grid style={[styles.topContainer, styles.paddedLR]}>
      <Row>
        <Col size={2}>
          <View spacer={true} />
          <Text bold={true} white={true}>
            {props.paymentReason}
          </Text>
        </Col>
        <Col size={1}>
          <View spacer={true} />
          <Text bold={true} white={true} style={styles.textRight}>
            {currentAmount}
          </Text>
        </Col>
      </Row>
      <Row>
        <Col size={2}>
          <Text white={true}>{props.recipient.denominazioneBeneficiario}</Text>
          <View spacer={true} />
        </Col>
        <Right>
          <Button small={true} transparent={true} onPress={props.onCancel}>
            <Text white={true} style={styles.rightButtonText}>
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
