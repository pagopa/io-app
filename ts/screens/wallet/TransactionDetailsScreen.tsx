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
import { Content, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import {
  ContextualHelpInjectedProps,
  withContextualHelp
} from "../../components/helpers/withContextualHelp";
import H5 from "../../components/ui/H5";
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
import { Transaction, Wallet } from "../../types/pagopa";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";
import { formatDateAsLocal } from "./../../utils/dates";

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
  },

  whyLink: {
    color: variables.textLinkColor
  },

  alignCenter: {
    alignItems: "center"
  },

  white: {
    color: variables.colorWhite
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  },

  whiteContent: {
    backgroundColor: variables.colorWhite,
    flex: 1
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  }
});

class TransactionDetailsScreen extends React.Component<Props> {
  private displayedWallet(transactionWallet: Wallet | undefined) {
    return transactionWallet ? (
      <RotatedCards cardType="Preview" wallets={[transactionWallet]} />
    ) : (
      <RotatedCards cardType="Preview" />
    );
  }

  /**
   * It provides the proper header to the screen. If isTransactionStarted
   * (the user displays the screen during the process of identify and accept a transaction)
   * then the "Thank you message" is displayed
   */
  private topContent(
    paymentCompleted: boolean,
    transactionWallet: Wallet | undefined
  ) {
    return (
      <React.Fragment>
        {paymentCompleted ? (
          <View>
            <Grid>
              <Col size={1} />
              <Col size={5} style={styles.alignCenter}>
                <View spacer={true} />
                <Row>
                  <H1 style={styles.white}>{I18n.t("wallet.thanks")}</H1>
                </Row>
                <Row>
                  <Text white={true}>{I18n.t("wallet.endPayment")}</Text>
                </Row>
                <View spacer={true} />
              </Col>
              <Col size={1} />
            </Grid>
          </View>
        ) : (
          <View spacer={true} />
        )}
        {this.displayedWallet(transactionWallet)}
      </React.Fragment>
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

    const transactionWallet = this.props.wallets
      ? this.props.wallets[transaction.idWallet]
      : undefined;

    return (
      <WalletLayout
        title={I18n.t("wallet.transaction")}
        allowGoBack={!isPaymentCompletedTransaction}
        topContent={this.topContent(
          isPaymentCompletedTransaction,
          transactionWallet
        )}
        hideHeader={true}
        hasDynamicSubHeader={false}
      >
        <Content
          scrollEnabled={false}
          style={[styles.noBottomPadding, styles.whiteContent]}
        >
          <Grid>
            <Row style={styles.titleRow}>
              <H5 style={styles.brandDarkGray}>
                {I18n.t("wallet.transactionDetails")}
              </H5>
              <IconFont
                name="io-close"
                size={variables.iconSizeBase}
                onPress={this.props.navigateToWalletHome}
                style={styles.brandDarkGray}
              />
            </Row>
            <View spacer={true} large={true} />
            {this.labelValueRow(
              I18n.t("wallet.total"),
              <H5 style={styles.value}>{totalAmount}</H5>
            )}
            {this.labelValueRow(I18n.t("wallet.payAmount"), amount)}
            {this.labelValueRow(
              <Text>
                <Text note={true}>{`${I18n.t("wallet.transactionFee")} `}</Text>
                <Text
                  note={true}
                  bold={true}
                  style={styles.whyLink}
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
              formatDateAsLocal(transaction.created, true)
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
