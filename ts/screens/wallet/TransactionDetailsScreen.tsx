/**
 * Transaction details screen, displaying
 * a list of information available about a
 * specific transaction.
 * TODO: check what controls implemented into this screen will be included into API
 *      - number deimals fixed to 2
 *      - get total amount from fee + amount
 *      - currency symbol
 *      - sum of amounts
 *      @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
 * TODO: insert contextual help to the Text link related to the fee
 *      @https://www.pivotaltracker.com/n/projects/2048617/stories/158108270
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, H1, H3, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import {
  ContextualHelpInjectedProps,
  withContextualHelp
} from "../../components/helpers/withContextualHelp";
import { WalletStyles } from "../../components/styles/wallet";
import IconFont from "../../components/ui/IconFont";
import Markdown from "../../components/ui/Markdown";
import { RotatedCards } from "../../components/wallet/card/RotatedCards";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import { navigateToWalletHome } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import { getWalletsById } from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";

type NavigationParams = Readonly<{
  isPaymentCompletedTransaction: boolean;
  transaction: Transaction;
}>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  NavigationInjectedProps<NavigationParams> &
  ContextualHelpInjectedProps;

/**
 * isTransactionStarted will be true when the user accepted to proceed with a transaction
 * and he is going to display the detail of the transaction as receipt
 */

const styles = StyleSheet.create({
  value: {
    flex: 1,
    flexDirection: "row"
  },
  align: {
    textAlign: "right"
  },
  titleRow: {
    justifyContent: "space-between"
  }
});

class TransactionDetailsScreen extends React.Component<Props> {
  /**
   * It provides the proper header to the screen. If isTransactionStarted
   * (the user displays the screen during the process of identify and accept a transaction)
   * then the "Thank you message" is displayed
   */
  private getSubHeader(paymentCompleted: boolean) {
    return paymentCompleted ? (
      <View>
        <Grid>
          <Col size={1} />
          <Col size={5} style={WalletStyles.alignCenter}>
            <View spacer={true} />
            <Row>
              <H1 style={WalletStyles.white}>{I18n.t("wallet.thanks")}</H1>
            </Row>
            <Row>
              <Text style={WalletStyles.white}>
                {I18n.t("wallet.endPayment")}
              </Text>
            </Row>
            <View spacer={true} />
          </Col>
          <Col size={1} />
        </Grid>
      </View>
    ) : (
      <View spacer={true} />
    );
  }

  /**
   * It provides the proper format to the listed content by using flex layout
   */
  private labelValueRow(
    label: string | React.ReactElement<any>,
    value: string | React.ReactElement<any>,
    labelIsNote: boolean = true
  ): React.ReactNode {
    return (
      <Col>
        <View spacer={true} />
        <Row style={{ alignItems: "center" }}>
          <Text note={labelIsNote}>{label}</Text>
          <Text style={[styles.value, styles.align]} bold={true}>
            {value}
          </Text>
        </Row>
      </Col>
    );
  }

  public render(): React.ReactNode {
    const transaction = this.props.navigation.getParam("transaction");

    // whether this transaction is the result of a just completed payment
    const isPaymentCompletedTransaction = this.props.navigation.getParam(
      "isPaymentCompletedTransaction",
      false
    );
    const amount = formatNumberAmount(centsToAmount(transaction.amount.amount));
    const fee = formatNumberAmount(
      centsToAmount(
        transaction.fee === undefined
          ? transaction.grandTotal.amount - transaction.amount.amount
          : transaction.fee.amount
      )
    );
    const totalAmount = formatNumberAmount(
      centsToAmount(transaction.grandTotal.amount)
    );

    // FIXME: in case the wallet for this transaction has been deleted, display
    //        a message in the wallet layout instead of an empty space
    const transactionWallet = this.props.wallets
      ? this.props.wallets[transaction.idWallet]
      : undefined;

    return (
      <WalletLayout
        title={I18n.t("wallet.transaction")}
        headerContents={this.getSubHeader(isPaymentCompletedTransaction)}
        displayedWallets={
          transactionWallet ? (
            <RotatedCards cardType="Preview" wallets={[transactionWallet]} />
          ) : (
            undefined
          )
        }
        allowGoBack={!isPaymentCompletedTransaction}
      >
        <Content
          scrollEnabled={false}
          style={[WalletStyles.noBottomPadding, WalletStyles.whiteContent]}
        >
          <Grid>
            <Row style={styles.titleRow}>
              <H3>{I18n.t("wallet.transactionDetails")}</H3>
              <IconFont
                name="io-close"
                size={variables.iconSizeBase}
                onPress={this.props.navigateToWalletHome}
              />
            </Row>
            <View spacer={true} large={true} />
            {this.labelValueRow(
              I18n.t("wallet.total"),
              <H3 style={styles.value}>{totalAmount}</H3>
            )}
            {this.labelValueRow(I18n.t("wallet.payAmount"), amount)}
            {this.labelValueRow(
              <Text>
                <Text note={true}>{`${I18n.t("wallet.transactionFee")} `}</Text>
                <Text
                  note={true}
                  style={WalletStyles.whyLink}
                  onPress={this.props.showHelp}
                >
                  {I18n.t("wallet.why")}
                </Text>
              </Text>,
              fee
            )}
            {this.labelValueRow(
              I18n.t("wallet.paymentReason"),
              cleanTransactionDescription(transaction.description)
            )}
            {this.labelValueRow(
              I18n.t("wallet.recipient"),
              transaction.merchant
            )}
            {this.labelValueRow(
              I18n.t("wallet.date"),
              transaction.created.toLocaleDateString()
            )}
            {this.labelValueRow(
              I18n.t("wallet.time"),
              transaction.created.toLocaleTimeString()
            )}
          </Grid>
        </Content>
      </WalletLayout>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => dispatch(navigateToWalletHome())
});

const mapStateToProps = (state: GlobalState) => ({
  wallets: pot.toUndefined(getWalletsById(state))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withContextualHelp(
    TransactionDetailsScreen,
    I18n.t("wallet.whyAFee.title"),
    () => <Markdown>{I18n.t("wallet.whyAFee.text")}</Markdown>
  )
);
