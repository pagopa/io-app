/**
 * This component displays a list of transactions
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Grid, Left, Right, Row, Text, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity
} from "react-native";

import I18n from "../../i18n";
import { ReadTransactionsState } from "../../store/reducers/entities/readTransactions";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";
import { BadgeComponent } from "../screens/BadgeComponent";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";
import H5 from "../ui/H5";

type Props = Readonly<{
  title: string;
  amount: string;
  transactions: pot.Pot<ReadonlyArray<Transaction>, Error>;
  navigateToTransactionDetails: (transaction: Transaction) => void;
  ListEmptyComponent?: React.ReactNode;
  readTransactions: ReadTransactionsState;
}>;

const styles = StyleSheet.create({
  transaction: {
    paddingVertical: variables.spacerHeight
  },

  itemSeparator: {
    backgroundColor: "#C9C9C9",
    height: 1 / 3
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },
  listItem: {
    marginLeft: 0,
    paddingRight: 0
  },
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
  },
  dateStyle: {
    lineHeight: 18,
    fontSize: 13
  },
  badgeStyle: {
    flex: 0,
    paddingTop: 4,
    paddingRight: 4
  },
  viewStyle: {
    flexDirection: "row"
  }
});

/**
 * Transactions List component
 */

export default class TransactionsList extends React.Component<Props> {
  private renderDate(item: Transaction) {
    // Check if the current transaction is stored among the read transactions.
    const isNew = this.props.readTransactions[item.id.toString()] === undefined;

    const datetime: string = `${formatDateAsLocal(
      item.created,
      true,
      true
    )} - ${item.created.toLocaleTimeString()}`;
    return (
      <Row>
        <Left>
          <View style={styles.viewStyle}>
            {isNew && (
              <View style={styles.badgeStyle}>
                <BadgeComponent />
              </View>
            )}
            <View>
              <Text note={true} style={styles.dateStyle}>
                {datetime}
              </Text>
            </View>
          </View>
        </Left>
      </Row>
    );
  }

  private renderTransaction = (info: ListRenderItemInfo<Transaction>) => {
    const item = info.item;
    const paymentReason = cleanTransactionDescription(item.description);
    const amount = formatNumberAmount(centsToAmount(item.amount.amount));
    const recipient = item.merchant;
    return (
      <TouchableOpacity
        onPress={() => this.props.navigateToTransactionDetails(item)}
      >
        <Grid style={styles.transaction}>
          {this.renderDate(item)}
          <Row>
            <Left>
              <Text>{paymentReason}</Text>
            </Left>
            <Right>
              <Text>{amount}</Text>
            </Right>
          </Row>
          <Row>
            <Left>
              <Text note={true}>{recipient}</Text>
            </Left>
          </Row>
        </Grid>
      </TouchableOpacity>
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
      // TODO: onPress should redirect to the transaction details @https://www.pivotaltracker.com/story/show/154442946
      <Content
        scrollEnabled={false}
        style={[styles.noBottomPadding, styles.whiteContent]}
      >
        <View>
          <View style={styles.subHeaderContent}>
            <H5 style={styles.brandDarkGray}>
              {I18n.t("wallet.latestTransactions")}
            </H5>
            <Text>{I18n.t("wallet.amount")}</Text>
          </View>
        </View>
        <FlatList
          scrollEnabled={false}
          removeClippedSubviews={false}
          data={transactions}
          renderItem={this.renderTransaction}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          keyExtractor={item => item.id.toString()}
        />
      </Content>
    );
  }
}
