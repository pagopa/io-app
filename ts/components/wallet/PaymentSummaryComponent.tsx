/**
 * This component will display the transaction details if updates on the amount are identified
 */
import { fromNullable } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber
} from "italia-pagopa-commons/lib/pagopa";
import { H1, H3, Text, View } from "native-base";
import * as React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";

import I18n from "../../i18n";
import variables from "../../theme/variables";
import { formatNumberAmount } from "../../utils/stringBuilder";
import IconFont from "../ui/IconFont";

type Props =
  | Readonly<{
      amount: AmountInEuroCents;
      updatedAmount: AmountInEuroCents;
      paymentReason: string;
      hasVerificaResponse: true;
    }>
  | Readonly<{
      hasVerificaResponse: false;
      amount: AmountInEuroCents;
    }>;

const styles = StyleSheet.create({
  padded: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },

  iconStyle: {
    fontSize: 24,
    paddingLeft: 10
  },

  toAlignColumnstart: {
    flexDirection: "column",
    alignItems: "flex-start"
  },

  noBottomLine: Platform.select({
    ios: {
      lineHeight: 0
    },
    android: {}
  }),

  amountTitleLabel: {
    fontSize: variables.fontSizeBase * 1.25,
    fontWeight: "700",
    lineHeight: variables.fontSizeBase * 1.5
  },

  reasonLabel: {
    fontSize: variables.fontSizeBase,
    fontWeight: "700",
    lineHeight: variables.fontSizeBase * 1.5
  },

  updateInfoRow: {
    marginTop: variables.fontSizeBase / 2
  },

  header: {
    backgroundColor: variables.brandDarkGray
  },

  alignCenter: {
    alignItems: "center"
  },

  flexRow: {
    flex: 1,
    flexDirection: "row"
  },

  white: {
    color: variables.colorWhite
  }
});

class PaymentSummaryComponent extends React.Component<Props> {
  private labelValueRow(label: React.ReactNode, value: React.ReactNode) {
    return (
      <Row style={styles.alignCenter}>
        <Col size={2} style={[styles.flexRow, styles.alignCenter]}>
          {label}
        </Col>
        <Col style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          {value}
        </Col>
      </Row>
    );
  }

  public render(): React.ReactNode {
    const amount = this.props.hasVerificaResponse
      ? AmountInEuroCentsFromNumber.encode(this.props.amount)
      : undefined;
    const updatedAmount = this.props.hasVerificaResponse
      ? AmountInEuroCentsFromNumber.encode(this.props.updatedAmount)
      : undefined;
    const paymentReason = this.props.hasVerificaResponse
      ? this.props.paymentReason
      : undefined;
    const amountIsUpdated =
      this.props.hasVerificaResponse &&
      this.props.amount !== this.props.updatedAmount;
    return (
      <Grid style={[styles.header, styles.padded]}>
        <View spacer={true} large={true} />
        <Row>
          <Col size={5}>
            <Text style={[styles.amountTitleLabel, styles.white]}>
              {I18n.t("wallet.firstTransactionSummary.title")}
            </Text>
            <View spacer={true} large={true} />
            <Text style={[styles.reasonLabel, styles.white]}>
              {paymentReason !== undefined ? paymentReason : "..."}
            </Text>
          </Col>
          <Col
            size={1}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={require("../../../img/wallet/icon-avviso-pagopa.png")}
            />
          </Col>
        </Row>
        <View spacer={true} large={true} />

        {this.labelValueRow(
          <View style={[styles.flexRow, styles.alignCenter]}>
            <Text style={[styles.amountTitleLabel, styles.white]}>
              {I18n.t(
                amountIsUpdated
                  ? "wallet.firstTransactionSummary.updatedAmount"
                  : "wallet.firstTransactionSummary.amount"
              )}
            </Text>
            {amountIsUpdated && (
              <IconFont
                style={[styles.white, styles.iconStyle]}
                name={"io-notice"}
              />
            )}
          </View>,
          <H3 style={styles.white}>
            {amountIsUpdated && updatedAmount
              ? formatNumberAmount(updatedAmount)
              : fromNullable(amount).fold("...", formatNumberAmount)}
          </H3>
        )}

        <Row style={[styles.toAlignColumnstart, styles.updateInfoRow]}>
          <Text white={true}>
            {I18n.t("wallet.firstTransactionSummary.updateInfo")}
          </Text>
        </Row>

        {false && // tslint:disable-line no-redundant-boolean
          // TODO: gotta define where this information is coming from @https://www.pivotaltracker.com/story/show/159229285
          this.labelValueRow(
            <H3 style={[styles.white, styles.noBottomLine]}>
              {I18n.t("wallet.firstTransactionSummary.expireDate")}
            </H3>,
            <H1 style={styles.white}>
              {new Date("2018-07-11T09:52:05.228Z").toLocaleDateString()}
            </H1>
          )}

        {false && // tslint:disable-line no-redundant-boolean
          // TODO: gotta define where this information is coming from @https://www.pivotaltracker.com/story/show/159229285
          this.labelValueRow(
            <H3 style={[styles.white, styles.noBottomLine]}>
              {I18n.t("wallet.firstTransactionSummary.tranche")}
            </H3>,
            <H1 style={styles.white}>{"unica"}</H1>
          )}
        <View spacer={true} />
      </Grid>
    );
  }
}

export default PaymentSummaryComponent;
