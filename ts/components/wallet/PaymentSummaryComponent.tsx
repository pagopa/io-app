/**
 * This component will display the transaction details if updates on the amount are identified
 */
import { fromNullable } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  AmountInEuroCentsFromNumber
} from "italia-ts-commons/lib/pagopa";
import { H1, H3, Icon, Text, View } from "native-base";
import * as React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";

import { WalletStyles } from "../../components/styles/wallet";

import I18n from "../../i18n";

import variables from "../../theme/variables";

import { formatNumberAmount } from "../../utils/stringBuilder";

type Props =
  | Readonly<{
      amount: AmountInEuroCents;
      updatedAmount: AmountInEuroCents;
      paymentReason: string;
      hasVerificaResponse: true;
    }>
  | Readonly<{
      hasVerificaResponse: false;
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

  strikeThrough: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid"
  },

  toAlignCenter: {
    flexDirection: "row",
    alignItems: "baseline"
  },

  toAlignColumnstart: {
    flexDirection: "column",
    alignItems: "flex-start"
  },

  underlined: {
    textDecorationLine: "underline",
    color: variables.brandLight
  },

  iconMargin: {
    marginBottom: 3,
    marginLeft: 3
  },

  noBottomLine: Platform.select({
    ios: {
      lineHeight: 0
    },
    android: {
      // do nothing for android -- lineHeight
      // does not work as expected
      // TODO: figure why this is not working on android @https://www.pivotaltracker.com/story/show/159229134
    }
  }),

  amountLabel: {
    color: variables.colorWhite,
    fontSize: variables.fontSizeBase * 1.25,
    fontWeight: "700",
    lineHeight: variables.fontSizeBase * 1.5
  },

  updateInfoRow: {
    marginTop: variables.fontSizeBase / 2
  }
});

class PaymentSummaryComponent extends React.Component<Props> {
  private labelValueRow(label: React.ReactNode, value: React.ReactNode) {
    return (
      <Row style={WalletStyles.alignCenter}>
        <Col size={2} style={[WalletStyles.flexRow, WalletStyles.alignCenter]}>
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
      <Grid style={[WalletStyles.header, styles.padded]}>
        <View spacer={true} large={true} />
        <Row>
          <Col size={5}>
            <H3 style={WalletStyles.white}>
              {I18n.t("wallet.firstTransactionSummary.title")}
            </H3>
            <H1 style={WalletStyles.white}>
              {paymentReason !== undefined ? paymentReason : "..."}
            </H1>
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
          <View style={[WalletStyles.flexRow, WalletStyles.alignCenter]}>
            <Text style={styles.amountLabel}>
              {I18n.t(
                amountIsUpdated
                  ? "wallet.firstTransactionSummary.updatedAmount"
                  : "wallet.firstTransactionSummary.amount"
              )}
            </Text>
            {amountIsUpdated && (
              <Icon
                style={[WalletStyles.white, styles.iconStyle]}
                name="alert-circle"
                type="Feather"
              />
            )}
          </View>,
          <H3 style={WalletStyles.white}>
            {amountIsUpdated && updatedAmount
              ? formatNumberAmount(updatedAmount)
              : fromNullable(amount).fold("...", formatNumberAmount)}
          </H3>
        )}

        <Row style={[styles.toAlignColumnstart, styles.updateInfoRow]}>
          <Text style={WalletStyles.white}>
            {I18n.t("wallet.firstTransactionSummary.updateInfo")}
          </Text>
        </Row>

        {false && // tslint:disable-line no-redundant-boolean
          // TODO: gotta define where this information is coming from @https://www.pivotaltracker.com/story/show/159229285
          this.labelValueRow(
            <H3 style={[WalletStyles.white, styles.noBottomLine]}>
              {I18n.t("wallet.firstTransactionSummary.expireDate")}
            </H3>,
            <H1 style={WalletStyles.white}>
              {new Date("2018-07-11T09:52:05.228Z").toLocaleDateString()}
            </H1>
          )}

        {false && // tslint:disable-line no-redundant-boolean
          // TODO: gotta define where this information is coming from @https://www.pivotaltracker.com/story/show/159229285
          this.labelValueRow(
            <H3 style={[WalletStyles.white, styles.noBottomLine]}>
              {I18n.t("wallet.firstTransactionSummary.tranche")}
            </H3>,
            <H1 style={WalletStyles.white}>{"unica"}</H1>
          )}
        <View spacer={true} />
      </Grid>
    );
  }
}

export default PaymentSummaryComponent;
