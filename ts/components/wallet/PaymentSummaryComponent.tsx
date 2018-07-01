/**
 * This component will display the transaction details if updates on the amount are identified
 */
import { H1, H3, Icon, Right, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProps, NavigationState } from "react-navigation";
import { WalletStyles } from "../../components/styles/wallet";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type OwnProps = Readonly<{
  amount: string;
  updatedAmount: string;
}>;

type Props = OwnProps & NavigationScreenProps<NavigationState>;

const styles = StyleSheet.create({
  padded: {
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
  },

  underlined: {
    textDecorationLine: "underline",
    color: variables.brandLight
  },

  iconMargin: {
    marginBottom: 3,
    marginLeft: 3
  }
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

  public render(): React.ReactNode {
    return (
      <Grid style={[WalletStyles.backContent, styles.padded]}>
        <View spacer={true} large={true} />
        <Row>
          <H3 style={WalletStyles.white}>
            {I18n.t("wallet.firstTransactionSummary.amount")}
          </H3>
          <Right>
            <H1
              style={
                this.isAmountUpdated() ? styles.whiteStrike : WalletStyles.white
              }
            >
              {this.props.amount + "€"}
            </H1>
          </Right>
        </Row>
        <View spacer={true} />

        {this.isAmountUpdated() && (
          <Row style={styles.toAlignCenter}>
            <H3 style={WalletStyles.white}>
              {I18n.t("wallet.firstTransactionSummary.updatedAmount")}
            </H3>
            <Icon
              style={[WalletStyles.white, styles.iconMargin]}
              name={"alert-circle"}
              type={"Feather"}
            />
            <Right>
              <H1 style={WalletStyles.white}>
                {this.props.updatedAmount + "€"}
              </H1>
            </Right>
            <View spacer={true} />
          </Row>
        )}

        {this.isAmountUpdated() && (
          <Row style={styles.toAlignColumnstart}>
            <Text style={WalletStyles.white}>
              {I18n.t("wallet.firstTransactionSummary.updateInfo")}
            </Text>
            <Text style={styles.underlined}>
              {I18n.t("wallet.firstTransactionSummary.moreInfo")}
            </Text>
            <View spacer={true} />
          </Row>
        )}

        {this.isAmountUpdated() && (
          <Row>
            <Text style={{ textDecorationLine: "underline" }}>
              {I18n.t("wallet.firstTransactionSummary.moreInfo")}
            </Text>
          </Row>
        )}
      </Grid>
    );
  }
}
