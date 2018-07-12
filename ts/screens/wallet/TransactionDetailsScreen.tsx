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
import * as React from "react";

import { Content, H1, H3, Text, View } from "native-base";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Wallet } from "../../../definitions/pagopa/Wallet";
import { WalletStyles } from "../../components/styles/wallet";
import IconFont from "../../components/ui/IconFont";
import WalletLayout from "../../components/wallet/WalletLayout";
import { CardEnum } from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { selectedCreditCardSelector } from "../../store/reducers/wallet/cards";
import { transactionForDetailsSelector } from "../../store/reducers/wallet/transactions";
import variables from "../../theme/variables";
import { UNKNOWN_CARD } from "../../types/unknown";
import { UNKNOWN_TRANSACTION, WalletTransaction } from "../../types/wallet";
import ROUTES from '../../navigation/routes';

type ReduxMappedProps = Readonly<{
  transaction: WalletTransaction;
  selectedCard: Wallet;
}>;

type Props = ReduxMappedProps & NavigationInjectedProps;

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

export class TransactionDetailsScreen extends React.Component<Props> {

  /**
   * It provide the currency EUR symbol
   * TODO: verify how approach the euro notation
   * @https://www.pivotaltracker.com/n/projects/2048617/stories/158330111
   */
  private getCurrencySymbol(currency: string) {
    if (currency === "EUR") {
      return "€";
    } else {
      return currency;
    }
  }

  /**
   * It sum the amount to pay and the fee requested to perform the transaction
   * TO DO: If required, it should be implemented the proper algorithm to manage values
   * from 10^13
   *  @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
   */
  private getTotalAmount(transaction: Readonly<WalletTransaction>) {
    return transaction.amount + transaction.transactionCost;
  }

  /**
   * It provides the proper header to the screen. If isTransactionStarted
   * (the user displays the screen during the process of identify and accept a transaction)
   * then the "Thank you message" is displayed
   */
  private getSubHeader() {
    return this.props.navigation.getParam("paymentCompleted", false) ? (
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
        <Row>
          <Text note={labelIsNote}>{label}</Text>
          <Text style={[styles.value, styles.align]} bold={true}>
            {value}
          </Text>
        </Row>
      </Col>
    );
  }

  public render(): React.ReactNode {
    const { transaction } = this.props;
    const dt = new Date(transaction.isoDatetime);

    return (
      <WalletLayout
        title={I18n.t("wallet.transaction")}
        navigation={this.props.navigation}
        headerContents={this.getSubHeader()}
        cardType={{ type: CardEnum.HEADER, card: this.props.selectedCard }}
        showPayButton={false}
        allowGoBack={!this.props.navigation.getParam("paymentCompleted", false)}
      >
        <Content scrollEnabled={false} style={WalletStyles.whiteContent}>
          <Grid>
            <Row style={styles.titleRow}>
              <H3>{I18n.t("wallet.transactionDetails")}</H3>
              <IconFont
                name="io-close"
                size={variables.iconSizeBase}
                onPress={() =>
                  this.props.navigation.getParam("paymentCompleted", false)
                    ? this.props.navigation.navigate(ROUTES.WALLET_HOME)
                    : this.props.navigation.goBack()
                }
              />
            </Row>
            <View spacer={true} extralarge={true} />
            <Row>
              <Text>
                {`${I18n.t("wallet.total")}  `}
                <H3 style={styles.value}>
                  {`-${this.getTotalAmount(transaction).toFixed(
                    2
                  )} ${this.getCurrencySymbol(transaction.currency)}`}
                </H3>
              </Text>
            </Row>
            {this.labelValueRow(
              I18n.t("wallet.payAmount"),
              `${transaction.amount.toFixed(2)} ${this.getCurrencySymbol(
                transaction.currency
              )}`
            )}
            {this.labelValueRow(
              <Text>
                <Text note={true}>{`${I18n.t("wallet.transactionFee")} `}</Text>
                <Text note={true} style={WalletStyles.whyLink}>
                  {I18n.t("wallet.why")}
                </Text>
              </Text>,
              `${transaction.transactionCost.toFixed(
                2
              )} ${this.getCurrencySymbol(transaction.currency)}`
            )}
            {this.labelValueRow(
              I18n.t("wallet.paymentReason"),
              transaction.paymentReason
            )}
            {this.labelValueRow(
              I18n.t("wallet.recipient"),
              transaction.recipient
            )}
            {this.labelValueRow(I18n.t("wallet.date"), dt.toLocaleDateString())}
            {this.labelValueRow(I18n.t("wallet.time"), dt.toLocaleTimeString())}
          </Grid>
        </Content>
      </WalletLayout>
    );
  }
}
const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  transaction: transactionForDetailsSelector(state).getOrElse(
    UNKNOWN_TRANSACTION
  ),
  selectedCard: selectedCreditCardSelector(state).getOrElse(UNKNOWN_CARD)
});

export default connect(mapStateToProps)(TransactionDetailsScreen);
