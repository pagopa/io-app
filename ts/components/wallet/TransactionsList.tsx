/**
 * This component displays a list of transactions
 */
import * as pot from "italia-ts-commons/lib/pot";
import {
  Body,
  Content,
  Grid,
  H3,
  Left,
  List,
  ListItem,
  Right,
  Row,
  Text
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";

type Props = Readonly<{
  title: string;
  totalAmount: string;
  transactions: pot.Pot<ReadonlyArray<Transaction>, Error>;
  navigateToTransactionDetails: (transaction: Transaction) => void;
  ListEmptyComponent?: React.ReactNode;
}>;

const styles = StyleSheet.create({
  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },

  newIconStyle: {
    marginTop: 6,
    fontSize: variables.fontSize1,
    color: variables.brandPrimary
  },

  listItem: {
    marginLeft: 0,
    paddingRight: 0
  },

  whiteContent: {
    backgroundColor: variables.colorWhite,
    flex: 1
  }
});

/**
 * Transactions List component
 */

export default class TransactionsList extends React.Component<Props> {
  private renderDate(item: Transaction) {
    const isNew = false; // TODO : handle notification of new transactions @https://www.pivotaltracker.com/story/show/158141219
    const datetime: string = `${item.created.toLocaleDateString()} - ${item.created.toLocaleTimeString()}`;
    return (
      <Row>
        <Left>
          <Text>
            {isNew && <IconFont name="io-new" style={styles.newIconStyle} />}
            <Text note={true}>{isNew ? `  ${datetime}` : datetime}</Text>
          </Text>
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
        <Grid>
          <Row>
            <Left>
              <H3>{this.props.title}</H3>
            </Left>
            <Right>
              <Text>{this.props.totalAmount}</Text>
            </Right>
          </Row>
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
