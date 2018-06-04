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
import { GlobalState } from "../../reducers/types";
import { showTransactionDetails } from "../../store/actions/wallet";
import {
  hasSelectedTransactions,
  transactionsSelector
} from "../../store/reducers/wallet";
import { WalletTransaction } from "../../types/wallet";
import { WalletStyles } from "../styles/wallet";

type ReduxMappedDispatchProps = Readonly<{
  selectTransaction: (item: WalletTransaction) => void;
}>;

type ReduxMappedStateProps = Readonly<{
  transactions: ReadonlyArray<WalletTransaction>;
}>;

type OwnProps = Readonly<{
  title: string;
  totalAmount: string;
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
  data: ReadonlyArray<WalletTransaction>;
}>;

type Props = OwnProps & ReduxMappedDispatchProps & ReduxMappedStateProps;
/**
 * Transactions List component
 */
class TransactionsList extends React.Component<Props, State> {
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

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => {
  if (hasSelectedTransactions(state.wallet)) {
    return {
      transactions: transactionsSelector(state.wallet)
    };
  }
  return {
    transactions: []
  };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  selectTransaction: (item: WalletTransaction) =>
    dispatch(showTransactionDetails(item))
});
export default connect(mapStateToProps, mapDispatchToProps)(TransactionsList);
