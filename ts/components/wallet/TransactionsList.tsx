/**
 * This component displays a list of transactions
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import I18n from "../../i18n";
import { ReadTransactionsState } from "../../store/reducers/entities/readTransactions";
import { PaymentsHistoryState } from "../../store/reducers/payments/history";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";
import DetailedlistItemComponent from "../DetailedlistItemComponent";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";
import H5 from "../ui/H5";

type Props = Readonly<{
  title: string;
  amount: string;
  transactions: pot.Pot<ReadonlyArray<Transaction>, Error>;
  navigateToTransactionDetails: (transaction: Transaction) => void;
  navigateToPaymentDetail: () => void;
  paymentsHistory: PaymentsHistoryState;
  ListEmptyComponent?: React.ReactNode;
  readTransactions: ReadTransactionsState;
}>;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: variables.colorWhite,
    flex: 1
  },
  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  brandDarkGray: {
    color: variables.brandDarkGray
  }
});

/**
 * Transactions List component
 */

export default class TransactionsList extends React.Component<Props> {
  private renderTransaction = (info: ListRenderItemInfo<Transaction>) => {
    const item = info.item;
    const paymentReason = cleanTransactionDescription(item.description);
    const recipient = item.merchant;
    // Check if the current transaction is stored among the read transactions.
    const isNew = this.props.readTransactions[item.id.toString()] === undefined;

    const amount = formatNumberAmount(centsToAmount(item.amount.amount));
    const datetime: string = `${formatDateAsLocal(
      item.created,
      true,
      true
    )} - ${item.created.toLocaleTimeString()}`;
    return (
      <DetailedlistItemComponent
        isNew={isNew}
        text11={recipient}
        text12={amount}
        text2={datetime}
        text3={paymentReason}
        onPressItem={() => this.props.navigateToTransactionDetails(item)}
      />
    );
  };

  public render(): React.ReactNode {
    const { ListEmptyComponent } = this.props;

    if (pot.isLoading(this.props.transactions)) {
      return (
        <BoxedRefreshIndicator
          white={true}
          caption={<Text>{I18n.t("wallet.transactionsLoadMessage")}</Text>}
        />
      );
    }
    const transactions: ReadonlyArray<Transaction> = pot.getOrElse(
      this.props.transactions,
      []
    );
    return transactions.length === 0 && ListEmptyComponent ? (
      ListEmptyComponent
    ) : (
      <Content scrollEnabled={false} style={styles.whiteContent}>
        <View>
          <View style={styles.subHeaderContent}>
            <H5 style={styles.brandDarkGray}>
              {I18n.t("wallet.latestTransactions")}
            </H5>
            <Text>{I18n.t("wallet.amount")}</Text>
          </View>
        </View>
        {this.props.paymentsHistory.length > 0 && (
          <Text>
            {I18n.t("wallet.transactionHelpMessage.text1")}{" "}
            <TouchableWithoutFeedback
              onPress={() => this.props.navigateToPaymentDetail()}
            >
              <Text
                style={{
                  color: variables.brandPrimary,
                  textDecorationLine: "underline",
                  fontWeight: "600"
                }}
              >
                {I18n.t("wallet.transactionHelpMessage.text2")}
              </Text>
            </TouchableWithoutFeedback>{" "}
            {I18n.t("wallet.transactionHelpMessage.text3")}
          </Text>
        )}
        <FlatList
          scrollEnabled={false}
          data={transactions}
          renderItem={this.renderTransaction}
          ItemSeparatorComponent={() => (
            <ItemSeparatorComponent noPadded={true} />
          )}
          keyExtractor={item => item.id.toString()}
          ListFooterComponent={
            transactions.length > 0 && <EdgeBorderComponent />
          }
        />
      </Content>
    );
  }
}
