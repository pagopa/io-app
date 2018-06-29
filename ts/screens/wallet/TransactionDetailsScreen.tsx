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
import { WalletStyles } from "../../components/styles/wallet";
import { CardEnum, WalletLayout } from "../../components/wallet/WalletLayout";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { selectedCreditCardSelector } from "../../store/reducers/wallet/cards";
import { transactionForDetailsSelector } from "../../store/reducers/wallet/transactions";
import Icon from "../../theme/font-icons/io-icon-font/index";
import variables from "../../theme/variables";
import { CreditCard, UNKNOWN_CARD } from "../../types/CreditCard";
import { UNKNOWN_TRANSACTION, WalletTransaction } from "../../types/wallet";

type ReduxMappedProps = Readonly<{
  transaction: WalletTransaction;
  selectedCard: CreditCard;
}>;

type Props = ReduxMappedProps & NavigationInjectedProps;

/**
 * isTransactionStarted will be true when the user accepted to proceed with a transaction
 * and he is going to display the detail of the transaction as receipt
 */
type State = Readonly<{
  isTransactionStarted: boolean;
}>;

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

/**
 * Details of transaction
 * TODO: implement the proper state control
 * @https://www.pivotaltracker.com/n/projects/2048617/stories/158395136
 */
export class TransactionDetailsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isTransactionStarted: false
    };
  }

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
    return transaction.amount + transaction.fee;
  }

  /**
   * It provides the proper header to the screen. If isTransactionStarted
   * (the user displays the screen during the process of identify and accept a transaction)
   * then the "Thank you message" is displayed
   */
  private getSubHeader() {
    return this.state.isTransactionStarted ? (
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
    const dt = new Date(transaction.datetime);

    return (
      <WalletLayout
        title={I18n.t("wallet.transaction")}
        navigation={this.props.navigation}
        headerContents={this.getSubHeader()}
        cardType={{ type: CardEnum.HEADER, card: this.props.selectedCard }}
        showPayButton={false}
      >
        <Content scrollEnabled={false} style={WalletStyles.whiteContent}>
          <Grid>
            <Row style={styles.titleRow}>
              <H3>{I18n.t("wallet.transactionDetails")}</H3>
              <Icon name="io-close" size={variables.iconSizeBase} />
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
              `${transaction.fee.toFixed(
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
