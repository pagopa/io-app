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

import { connect, Dispatch } from "react-redux";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

import { selectTransactionForDetails } from "../../store/actions/wallet/transactions";
import { GlobalState } from "../../store/reducers/types";
import {
  latestTransactionsSelector,
  transactionsByCardSelector
} from "../../store/reducers/wallet/transactions";
import { WalletTransaction } from "../../types/wallet";
import { WalletStyles } from "../styles/wallet";

type ReduxMappedStateProps = Readonly<{
  transactions: ReadonlyArray<WalletTransaction>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  selectTransaction: (i: WalletTransaction) => void;
}>;

/**
 * The type of transactions that are to be shown
 */
export enum TransactionsDisplayed {
  LATEST,
  BY_CARD
}

type OwnProps = Readonly<{
  title: string;
  totalAmount: string;
  navigation: NavigationScreenProp<NavigationState>;
  display: TransactionsDisplayed;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;
/**
 * Transactions List component
 */
class TransactionsList extends React.Component<Props> {
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
    const { transactions } = this.props;

    if (transactions.length === 0) {
      return <Text>{I18n.t("wallet.noTransactions")}</Text>;
    }
    // TODO: onPress should redirect to the transaction details @https://www.pivotaltracker.com/story/show/154442946
    return (
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
            removeClippedSubviews={false}
            dataArray={transactions as any[]} // tslint:disable-line
            renderRow={(item): React.ReactElement<any> => (
              <ListItem
                onPress={() => {
                  this.props.selectTransaction(item);
                  navigate(ROUTES.WALLET_TRANSACTION_DETAILS);
                }}
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

const mapStateToProps = (
  state: GlobalState,
  props: OwnProps
): ReduxMappedStateProps => {
  switch (props.display) {
    case TransactionsDisplayed.LATEST: {
      return {
        transactions: latestTransactionsSelector(state)
      };
    }
    case TransactionsDisplayed.BY_CARD: {
      return {
        transactions: transactionsByCardSelector(state)
      };
    }
  }
  return { transactions: [] };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  selectTransaction: item => dispatch(selectTransactionForDetails(item))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsList);
