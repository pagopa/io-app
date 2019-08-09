/**
 * This component displays a list of transactions
 */
import * as pot from "italia-ts-commons/lib/pot";
import {
  Body,
  Content,
  Grid,
  Left,
  List,
  ListItem,
  Right,
  Row,
  Text,
  View
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import I18n from "../../i18n";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";
import { BadgeComponent } from "../screens/BadgeComponent";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";
import H5 from "../ui/H5";

type Props = Readonly<{
  title: string;
  amount: string;
  transactions: pot.Pot<ReadonlyArray<Transaction>, Error>;
  navigateToTransactionDetails: (transaction: Transaction) => void;
  ListEmptyComponent?: React.ReactNode;
}>;

const styles = StyleSheet.create({
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
    const isNew = true; // TODO : handle notification of new transactions @https://www.pivotaltracker.com/story/show/158141219
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

  private renderRow = (item: Transaction): React.ReactElement<any> => {
    const paymentReason = cleanTransactionDescription(item.description);
    const amount = formatNumberAmount(centsToAmount(item.amount.amount));
    const recipient = item.merchant;
    return (
      <ListItem
        style={styles.listItem}
        onPress={() => this.props.navigateToTransactionDetails(item)}
      >
        <Body>
          <Grid>
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
        </Body>
      </ListItem>
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

    const transactions = pot.getOrElse(this.props.transactions, []);

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

        <Grid>
          <Row>
            <List
              scrollEnabled={false}
              removeClippedSubviews={false}
              dataArray={transactions as Transaction[]} // tslint:disable-line: readonly-array
              renderRow={this.renderRow}
            />
          </Row>
        </Grid>
      </Content>
    );
  }
}
