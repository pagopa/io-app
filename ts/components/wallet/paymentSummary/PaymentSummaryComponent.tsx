/**
 * this component will display the transaction details if no updates on the amount are not identified
 */
import { H1, H3, Right, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletStyles } from "../../../components/styles/wallet";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
  amount: string;
  expireDate: string;
  tranche: string;
}>;

const styles = StyleSheet.create({
  contentPadding: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },

  darkContentPadding: {
    backgroundColor: variables.brandDarkGray,
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },

  whiteStrike: {
    fontSize: variables.fontSizeBase * 1.25,
    color: variables.brandLight,
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
  }
});

export default class PaymentSummaryComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <Grid style={styles.darkContentPadding}>
        <View spacer={true} large={true} />
        <Row>
          <H3 style={WalletStyles.white}>
            {I18n.t("wallet.firstTransactionSummary.amount")}
          </H3>
          <Right>
            <H1 style={WalletStyles.white}>{this.props.amount + "€"}</H1>
          </Right>
        </Row>
        <View spacer={true} />
        <Row>
          <H3 style={WalletStyles.white}>
            {I18n.t("wallet.firstTransactionSummary.expireDate")}
          </H3>
          <Right>
            <H1 style={WalletStyles.white}>{this.props.expireDate}</H1>
          </Right>
        </Row>
        <View spacer={true} />
        <Row>
          <H3 style={WalletStyles.white}>
            {I18n.t("wallet.firstTransactionSummary.tranche")}
          </H3>
          <Right>
            <H1 style={WalletStyles.white}>{this.props.tranche}</H1>
          </Right>
        </Row>
        <View spacer={true} large={true} />
      </Grid>
    );
  }
}
