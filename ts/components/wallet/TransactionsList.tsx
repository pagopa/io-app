/**
 * This component displays a list of transactions
 */

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
  Text,
  View
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
import { Transaction } from "../../types/pagopa";
import { buildAmount, centsToAmount } from "../../utils/stringBuilder";
import { WalletStyles } from "../styles/wallet";

type ReduxMappedStateProps = Readonly<{
  transactions: ReadonlyArray<Transaction>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  selectTransaction: (i: Transaction) => void;
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
    const paymentReason = item.description;
    const amount = buildAmount(centsToAmount(item.amount.amount));
    const recipient = item.merchant;
    return (
      <ListItem
        style={WalletStyles.listItem}
        onPress={() => {
          this.props.selectTransaction(item);
          this.props.selectWallet(item.idWallet);
          this.props.navigation.navigate(ROUTES.WALLET_TRANSACTION_DETAILS);
        }}
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
    const { transactions } = this.props;

    if (transactions.length === 0) {
      return (
        <Content
          scrollEnabled={false}
          style={[WalletStyles.noBottomPadding, WalletStyles.whiteContent]}
        >
          <View spacer={true} />
          <H3>{I18n.t("wallet.noneTransactions")}</H3>
          <View spacer={true} />
          <Text>{I18n.t("wallet.noTransactionsDetails")}</Text>
          <View spacer={true} large={true} />
        </Content>
      );
    }
    // TODO: onPress should redirect to the transaction details @https://www.pivotaltracker.com/story/show/154442946
    return (
      <Content
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
