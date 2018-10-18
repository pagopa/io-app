/**
 * This component displays a summary on the transaction.
 * Used for the screens from the identification of the transaction to the end of the procedure.
 */

import { AmountInEuroCentsFromNumber } from "italia-ts-commons/lib/pagopa";
import { AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { Text, View } from "native-base";
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";

import { EnteBeneficiario } from "../../../definitions/backend/EnteBeneficiario";
import I18n from "../../i18n";
import { UNKNOWN_PAYMENT_REASON, UNKNOWN_RECIPIENT } from "../../types/unknown";
import { formatNumberAmount } from "../../utils/stringBuilder";
import { WalletStyles } from "../styles/wallet";

type Props = Readonly<{
  paymentReason?: string;
  currentAmount: AmountInEuroCents;
  recipient?: EnteBeneficiario;
}>;

const PaymentBannerComponent: React.SFC<Props> = props => {
  const currentAmount = formatNumberAmount(
    AmountInEuroCentsFromNumber.encode(props.currentAmount)
  );
  const paymentReason = props.paymentReason || UNKNOWN_PAYMENT_REASON;
  const recipient = props.recipient || UNKNOWN_RECIPIENT;
  return (
    <Grid style={[WalletStyles.topContainer, WalletStyles.paddedLR]}>
      <Row>
        <Col>
          <View spacer={true} />
          <Text bold={true} style={WalletStyles.white}>
            {paymentReason}
          </Text>
        </Col>
        <Col>
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
        <Col>
          <Text style={WalletStyles.white}>
            {recipient.denominazioneBeneficiario}
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
  );
};

export default PaymentBannerComponent;
