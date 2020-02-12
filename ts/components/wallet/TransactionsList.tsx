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
  Platform
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
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";
import H5 from "../ui/H5";
import IconFont from "../ui/IconFont";
import customVariables from "../../theme/variables";
import { makeFontStyleObject } from "../../theme/fonts";

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
  badgeContainer: {
    flex: 0,
    paddingRight: 4,
    alignSelf: "flex-start",
    marginRight: 4,
    paddingTop: 6
  },
  viewStyle: {
    flexDirection: "row"
  },
  merchant: {
    fontSize: 14,
    lineHeight: 18,
    color: customVariables.brandDarkestGray
  },
  transcationUndread: {
    ...makeFontStyleObject(Platform.select, "700")
  },
  transactionRead: {
    ...makeFontStyleObject(Platform.select, "400")
  },
  transactionDescription: {
    fontSize: 18,
    lineHeight: 21,
    color: customVariables.brandDarkestGray
  },
  amount: {
    ...makeFontStyleObject(Platform.select, "700"),
    fontSize: 16,
    color: customVariables.brandDarkGray
  }
});

/**
 * Transactions List component
 */

export default class TransactionsList extends React.Component<Props> {
  private renderDate(item: Transaction) {
    const datetime: string = `${formatDateAsLocal(
      item.created,
      true,
      true
    )} - ${item.created.toLocaleTimeString()}`;
    const amount = formatNumberAmount(centsToAmount(item.amount.amount));
    return (
      <Row>
        <Left>
          <View style={styles.viewStyle}>
            <Text note={true} style={styles.dateStyle}>
              {datetime}
            </Text>
          </View>
        </Left>
        <Right>
          <Text style={styles.amount}>{amount}</Text>
        </Right>
      </Row>
    );
  }

  private renderTransaction = (info: ListRenderItemInfo<Transaction>) => {
    const item = info.item;
    const paymentReason = cleanTransactionDescription(item.description);
    const recipient = item.merchant;
    // Check if the current transaction is stored among the read transactions.
    const isNew = this.props.readTransactions[item.id.toString()] === undefined;
    return (
      <TouchableDefaultOpacity
        onPress={() => this.props.navigateToTransactionDetails(item)}
      >
        <Grid style={styles.transaction}>
          <Row>
            <Left>
              <Text style={styles.merchant}>{recipient}</Text>
            </Left>
          </Row>
          {this.renderDate(item)}
          <Row>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row" }}>
                  {isNew && (
                    <View style={styles.badgeContainer}>
                      <BadgeComponent />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.transactionDescription,
                      isNew ? styles.transcationUndread : styles.transactionRead
                    ]}
                  >
                    {paymentReason}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: 64,
                  alignItems: "flex-end",
                  justifyContent: "center"
                }}
              >
                <IconFont
                  name="io-right"
                  size={24}
                  color={customVariables.contentPrimaryBackground}
                />
              </View>
            </View>
          </Row>
        </Grid>
      </TouchableDefaultOpacity>
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
          ListFooterComponent={
            transactions.length > 0 && <EdgeBorderComponent />
          }
        />
      </Content>
    );
  }
}
