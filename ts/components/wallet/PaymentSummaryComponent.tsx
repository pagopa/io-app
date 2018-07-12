/**
 * This component will display the transaction details if updates on the amount are identified
 */
import { H1, H3, Icon, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet, Platform } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletStyles } from "../../components/styles/wallet";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
  amount: string;
  updatedAmount: string;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
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
      // TODO: figure this out
    }
  })
});

export default class PaymentSummaryComponent extends React.Component<Props> {
  /**
   * If differences occur between the amount on the notice and the amount saved remotely by the entity
   * it will be displayed a different component. If the values differ, then the user can display both the values
   * and a brief explanation related to the update.
   */
  private isAmountUpdated() {
    return this.props.updatedAmount !== this.props.amount;
  }

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
    return (
      <Grid style={[WalletStyles.header, styles.padded]}>
        <View spacer={true} large={true} />
        <Row>
          <Col size={5}>
            <H3 style={WalletStyles.white}>
              {I18n.t("wallet.firstTransactionSummary.title")}
            </H3>
            <H1 style={WalletStyles.white}>{"Tari 2018"}</H1>
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
          <H3 style={[WalletStyles.white, styles.noBottomLine]}>
            {I18n.t("wallet.firstTransactionSummary.amount")}
          </H3>,
          this.isAmountUpdated() ? (
            <H3 style={[WalletStyles.white, styles.strikeThrough]}>{`${this.props.amount} €`}</H3>
          ) : (
            <H1 style={WalletStyles.white}>{`${this.props.amount} €`}</H1>
          )
        )}
        {this.isAmountUpdated() && (
          <View>
            {this.labelValueRow(
              <View style={[WalletStyles.flexRow, WalletStyles.alignCenter]}>
                <H3 style={[WalletStyles.white, styles.noBottomLine]}>
                  {I18n.t("wallet.firstTransactionSummary.updatedAmount")}
                </H3>
                <Icon
                  style={[
                    WalletStyles.white,
                    { fontSize: 24, paddingLeft: 10 }
                  ]}
                  name={"alert-circle"}
                  type={"Feather"}
                />
              </View>,
              <H1 style={WalletStyles.white}>
                {`${this.props.updatedAmount} €`}
              </H1>
            )}
            <Row style={styles.toAlignColumnstart}>
              <Text style={WalletStyles.white}>
                {I18n.t("wallet.firstTransactionSummary.updateInfo")}
              </Text>
              <Text style={styles.underlined}>
                {I18n.t("wallet.firstTransactionSummary.moreInfo")}
              </Text>
            </Row>
          </View>
        )}
        {false && // tslint:disable-line no-redundant-boolean (TODO: gotta define where this information is coming from)
          this.labelValueRow(
            <H3 style={[WalletStyles.white, styles.noBottomLine]}>
              {I18n.t("wallet.firstTransactionSummary.expireDate")}
            </H3>,
            <H1 style={WalletStyles.white}>
              {new Date("2018-07-11T09:52:05.228Z").toLocaleDateString()}
            </H1>
          )}

        {false && // tslint:disable-line no-redundant-boolean (TODO: gotta define where this information is coming from)
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
