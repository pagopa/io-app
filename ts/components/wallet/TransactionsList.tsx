/**
 * This component displays a list of transactions
 */

import {
  Body,
  Content,
  Grid,
  Left,
  List,
  ListItem,
  Right,
  Row,
  Text
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import { selectTransactionForDetails } from "../../store/actions/wallet/transactions";
import { selectWalletForDetails } from "../../store/actions/wallet/wallets";
import { GlobalState } from "../../store/reducers/types";
import {
  latestTransactionsSelector,
  transactionsByWalletSelector
} from "../../store/reducers/wallet/transactions";
import { WalletTransaction } from "../../types/wallet";
import { WalletStyles } from "../styles/wallet";

type ReduxMappedStateProps = Readonly<{
  transactions: ReadonlyArray<WalletTransaction>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  selectTransaction: (i: WalletTransaction) => void;
  selectWallet: (item: number) => void;
}>;

/**
 * The type of transactions that are to be shown
 */
export enum TransactionsDisplayed {
  LATEST, // show the latest transactions
  BY_WALLET // show all the transactions paid with an already-selected wallet (available in the store)
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
  private renderDate(item: WalletTransaction) {
    const completedAt = new Date(item.isoDatetime);
    const datetime: string = `${completedAt.toLocaleDateString()} - ${completedAt.toLocaleTimeString()}`;
    return (
      <Row>
        <Left>
          <Text>
            {item.isNew && (
              <IconFont name="io-new" style={WalletStyles.newIconStyle} />
            )}
            <Text note={true}>{item.isNew ? `  ${datetime}` : datetime}</Text>
          </Text>
        </Left>
      </Row>
    );
  }

  private renderRow = (item: WalletTransaction): React.ReactElement<any> => (
    <ListItem
      onPress={() => {
        this.props.selectTransaction(item);
        this.props.selectWallet(item.cardId);
        this.props.navigation.navigate(ROUTES.WALLET_TRANSACTION_DETAILS);
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
    case TransactionsDisplayed.BY_WALLET: {
      return {
        transactions: transactionsByWalletSelector(state)
      };
    }
  }
  return { transactions: [] };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  selectTransaction: item => dispatch(selectTransactionForDetails(item)),
  selectWallet: item => dispatch(selectWalletForDetails(item))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsList);
