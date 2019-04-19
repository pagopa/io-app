/**
 * This component displays a list of transactions
 */
import * as pot from "italia-ts-commons/lib/pot";
import {
  Body,
  Grid,
  H3,
  Left,
  List,
  ListItem,
  Right,
  Row,
  Text,
  View
} from "native-base";
import * as React from "react";

import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { Transaction } from "../../types/pagopa";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";
import ScreenContent from "../shared/ScreenContent";
import { WalletStyles } from "../styles/wallet";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";

type Props = Readonly<{
  title: string;
  totalAmount: string;
  transactions: pot.Pot<ReadonlyArray<Transaction>, Error>;
  navigateToTransactionDetails: (transaction: Transaction) => void;
  noTransactionsDetailsMessage: string;
}>;

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
            {isNew && (
              <IconFont name="io-new" style={WalletStyles.newIconStyle} />
            )}
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
        style={WalletStyles.listItem}
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
    if (pot.isLoading(this.props.transactions)) {
      return (
        <BoxedRefreshIndicator
          caption={<Text>{I18n.t("wallet.transactionsLoadMessage")}</Text>}
        />
      );
    }

    const transactions = pot.getOrElse(this.props.transactions, []);

    if (transactions.length === 0) {
      return (
        <ScreenContent
          scrollEnabled={false}
          style={[WalletStyles.noBottomPadding, WalletStyles.whiteContent]}
        >
          <View spacer={true} />
          <H3>{I18n.t("wallet.noneTransactions")}</H3>
          <View spacer={true} />
          <Text>{this.props.noTransactionsDetailsMessage}</Text>
          <View spacer={true} large={true} />
        </ScreenContent>
      );
    }
    // TODO: onPress should redirect to the transaction details @https://www.pivotaltracker.com/story/show/154442946
    return (
      <ScreenContent
        scrollEnabled={false}
        style={[WalletStyles.noBottomPadding, WalletStyles.whiteContent]}
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
      </ScreenContent>
    );
  }
}
