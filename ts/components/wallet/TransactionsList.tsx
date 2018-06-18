/**
 * This component displays a list of transactions
 */

import {
  Body,
  Grid,
  Icon,
  Left,
  List,
  ListItem,
  Right,
  Row,
  Text
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { Content } from "native-base";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { WalletTransaction } from "../../types/wallet";
import { WalletStyles } from "../styles/wallet";

type Props = Readonly<{
  title: string;
  totalAmount: string;
  navigation: NavigationScreenProp<NavigationState>;
  transactions: ReadonlyArray<WalletTransaction>;
}>;

/**
 * Transactions List component
 */
export class TransactionsList extends React.Component<Props> {
  private renderDate(transaction: WalletTransaction) {
    const datetime: string = `${transaction.date} - ${transaction.time}`;
    return (
      <Row>
        <Left>
          <Text>
            {transaction.isNew && (
              <Icon
                type="FontAwesome"
                name="circle"
                active={true}
                style={WalletStyles.newIconStyle}
              />
            )}
            <Text note={true}>
              {transaction.isNew ? `  ${datetime}` : datetime}
            </Text>
          </Text>
        </Left>
      </Row>
    );
  }

  private renderRow = (item: WalletTransaction): React.ReactElement<any> => (
    <ListItem
      onPress={(): boolean =>
        this.props.navigation.navigate(ROUTES.WALLET_TRANSACTION_DETAILS, {
          transaction: item
        })
      }
    >
      <Body>
        <Grid>
          {this.renderDate(item)}
          <Row>
            <Left>
              <Text>{item.paymentReason}</Text>
            </Left>
            <Right>
              <Text>
                {item.amount} {item.currency}
              </Text>
            </Right>
          </Row>
          <Row>
            <Left>
              <Text note={true}>{item.recipient}</Text>
            </Left>
          </Row>
        </Grid>
      </Body>
    </ListItem>
  );

  public render(): React.ReactNode {
    const { transactions } = this.props;

    if (transactions.length === 0) {
      return (
        <Content scrollEnabled={false} style={WalletStyles.whiteContent}>
          <Text>{I18n.t("wallet.noTransactions")}</Text>
        </Content>
      );
    }
    // TODO: onPress should redirect to the transaction details @https://www.pivotaltracker.com/story/show/154442946
    return (
      <Content scrollEnabled={false} style={WalletStyles.whiteContent}>
        <Grid>
          <Row>
            <Left>
              <Text bold={true}>{this.props.title}</Text>
            </Left>
            <Right>
              <Text>{this.props.totalAmount}</Text>
            </Right>
          </Row>
          <Row>
            <List
              scrollEnabled={false}
              removeClippedSubviews={false}
              dataArray={transactions as WalletTransaction[]} // tslint:disable-line: readonly-array
              renderRow={this.renderRow}
            />
          </Row>
        </Grid>
      </Content>
    );
  }
}
