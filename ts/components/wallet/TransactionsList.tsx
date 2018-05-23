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

import I18n from "../../i18n";
import { WalletTransaction } from "../../types/wallet";
import { WalletStyles } from "../styles/wallet";

type Props = Readonly<{
  title: string;
  totalAmount: string;
  navigation: NavigationScreenProp<NavigationState>;
  transactions: ReadonlyArray<WalletTransaction>;
}>;

type State = Readonly<{
  data: ReadonlyArray<WalletTransaction>;
}>;

/**
 * Transactions List component
 */
export class TransactionsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { data: props.transactions };
  }

  private renderDate(transaction: WalletTransaction) {
    const datetime: string = `${transaction.date} - ${transaction.time}`;
    if (transaction.isNew) {
      return (
        <Row>
          <Icon
            type="FontAwesome"
            name="circle"
            active={true}
            style={WalletStyles.newIconStyle}
          />
          <Text note={true}>{datetime}</Text>
        </Row>
      );
    }
    return (
      <Row>
        <Text note={true}>{datetime}</Text>
      </Row>
    );
  }

  public render(): React.ReactNode {
    const { navigate } = this.props.navigation;
    const ops = this.state.data;

    if (ops.length === 0) {
      return <Text>{I18n.t("wallet.noTransactions")}</Text>;
    }
    // TODO: onPress should redirect to the transaction details @https://www.pivotaltracker.com/story/show/154442946
    return (
      <Grid>
        <Row>
          <Left>
            <Text style={WalletStyles.boldStyle}>{this.props.title}</Text>
          </Left>
          <Right>
            <Text>{this.props.totalAmount}</Text>
          </Right>
        </Row>
        <Row>
          <List
            removeClippedSubviews={false}
            dataArray={ops as any[]} // tslint:disable-line
            renderRow={(item): React.ReactElement<any> => (
              <ListItem onPress={(): boolean => navigate("")}>
                <Body>
                  <Grid>
                    {this.renderDate(item)}
                    <Row>
                      <Left>
                        <Text>{item.subject}</Text>
                      </Left>
                      <Right>
                        <Text>
                          {item.amount} {item.currency}
                        </Text>
                      </Right>
                    </Row>
                    <Row>
                      <Text note={true}>{item.location}</Text>
                    </Row>
                  </Grid>
                </Body>
              </ListItem>
            )}
          />
        </Row>
      </Grid>
    );
  }
}
