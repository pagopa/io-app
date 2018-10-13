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
import { Content, H1, H3, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { WalletStyles } from "../../components/styles/wallet";
import IconFont from "../../components/ui/IconFont";
import { CardEnum } from "../../components/wallet/WalletLayout";
import WalletLayout from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { navigateToWalletTransactionsScreen } from "../../store/actions/navigation";
import { GlobalState } from "../../store/reducers/types";
import { getWalletsById } from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Wallet } from "../../types/pagopa";
import { Transaction } from "../../types/pagopa";
import { buildAmount, centsToAmount } from "../../utils/stringBuilder";

type NavigationParams = Readonly<{
  isPaymentCompletedTransaction: boolean;
  transaction: Transaction;
}>;

type ReduxInjectedProps = Readonly<{
  wallets: ReturnType<typeof getWalletsById>;
}>;

type Props = ReduxInjectedProps & NavigationInjectedProps<NavigationParams>;

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
    const amount = buildAmount(centsToAmount(transaction.amount.amount));
    const fee = buildAmount(
      centsToAmount(
        transaction.fee === undefined
          ? transaction.grandTotal.amount - transaction.amount.amount
          : transaction.fee.amount
      )
    );
    const totalAmount = buildAmount(
      centsToAmount(transaction.grandTotal.amount)
    );

    // FIXME: in case the wallet for this transaction has been deleted, display
    //        a message in the wallet layout instead of an empty space
    const transactionWallet = this.props.wallets[transaction.idWallet];

    return (
      <WalletLayout
        title={I18n.t("wallet.transaction")}
        headerContents={this.getSubHeader(isPaymentCompletedTransaction)}
        cardType={
          transactionWallet
            ? { type: CardEnum.HEADER, card: transactionWallet }
            : { type: CardEnum.NONE }
        }
        showPayButton={false}
        allowGoBack={!isPaymentCompletedTransaction}
        navigateToWalletList={() =>
          this.props.navigation.navigate(ROUTES.WALLET_LIST)
        }
        navigateToScanQrCode={() =>
          this.props.navigation.navigate(ROUTES.PAYMENT_SCAN_QR_CODE)
        }
        navigateToWalletTransactions={(selectedWallet: Wallet) =>
          this.props.navigation.dispatch(
            navigateToWalletTransactionsScreen({
              selectedWallet
            })
          )
        }
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
                onPress={() =>
                  isPaymentCompletedTransaction
                    ? this.props.navigation.navigate(ROUTES.WALLET_HOME)
                    : this.props.navigation.goBack()
                }
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
                <Text note={true} style={WalletStyles.whyLink}>
                  {I18n.t("wallet.why")}
                </Text>
              </Text>,
              fee
            )}
            {this.labelValueRow(
              I18n.t("wallet.paymentReason"),
              transaction.description
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

export const mapStateToProps = (state: GlobalState): ReduxInjectedProps => ({
  wallets: getWalletsById(state)
});

export default connect(mapStateToProps)(TransactionDetailsScreen);
