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
import { connect } from "react-redux";

import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { getTransactions } from "../../store/reducers/wallet/transactions";
import { Transaction } from "../../types/pagopa";
import * as pot from "../../types/pot";
import { buildAmount, centsToAmount } from "../../utils/stringBuilder";
import { WalletStyles } from "../styles/wallet";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";

type ReduxMappedStateProps =
  | Readonly<{
      transactions: ReadonlyArray<Transaction>;
      isLoading: false;
    }>
  | Readonly<{
      isLoading: true;
    }>;

type OwnProps = Readonly<{
  title: string;
  totalAmount: string;
  selector: typeof getTransactions;
  navigateToTransactionDetails: (transaction: Transaction) => void;
}>;

type Props = OwnProps & ReduxMappedStateProps;
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
    if (this.props.isLoading) {
      return <BoxedRefreshIndicator />;
    }

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
  const potTransactions = props.selector(state);
  return pot.isLoading(potTransactions)
    ? { isLoading: true }
    : {
        isLoading: false,
        transactions: pot.getOrElse(potTransactions, [])
      };
};

export default connect(mapStateToProps)(TransactionsList);
