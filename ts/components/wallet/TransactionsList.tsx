/**
 * This component displays a list of transactions
 */
import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet
} from "react-native";
import I18n from "../../i18n";
import { ReadTransactionsState } from "../../store/reducers/entities/readTransactions";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { formatDateAsLocal } from "../../utils/dates";
import { cleanTransactionDescription } from "../../utils/payment";
import { centsToAmount, formatNumberAmount } from "../../utils/stringBuilder";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import DetailedlistItemComponent from "../DetailedlistItemComponent";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";
import H5 from "../ui/H5";
import { RTron } from "../../boot/configureStoreAndPersistor";

type State = {
  loadingMore: boolean;
};

type Props = Readonly<{
  title: string;
  amount: string;
  transactions: pot.Pot<ReadonlyArray<Transaction>, Error>;
  transactionsTotal: pot.Pot<number, Error>;
  onLoadMoreTransactions: () => void;
  navigateToTransactionDetails: (transaction: Transaction) => void;
  ListEmptyComponent?: React.ReactNode;
  readTransactions: ReadTransactionsState;
}>;
const screenWidth = Dimensions.get("screen").width;
const styles = StyleSheet.create({
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
  moreButton: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: screenWidth - variables.contentPadding * 2,
    backgroundColor: variables.colorWhite
  }
});

/**
 * Transactions List component
 */

export default class TransactionsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { loadingMore: false };
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    // loading more transaction is complete
    if (
      prevState.loadingMore &&
      pot.isLoading(prevProps.transactions) &&
      pot.isSome(this.props.transactions)
    ) {
      RTron.log("scroll to end");
      this.setState({ loadingMore: false });
    }
  }

  private renderTransaction = (info: ListRenderItemInfo<Transaction>) => {
    const item = info.item;
    const paymentReason = cleanTransactionDescription(item.description);
    const recipient = item.merchant;
    // Check if the current transaction is stored among the read transactions.
    const isNew = this.props.readTransactions[item.id.toString()] === undefined;

    const amount = formatNumberAmount(centsToAmount(item.amount.amount));
    const datetime: string = `${formatDateAsLocal(
      item.created,
      true,
      true
    )} - ${item.created.toLocaleTimeString()}`;
    return (
      <DetailedlistItemComponent
        isNew={isNew}
        text11={recipient}
        text12={amount}
        text2={datetime}
        text3={paymentReason}
        onPressItem={() => this.props.navigateToTransactionDetails(item)}
      />
    );
  };

  private footerListComponent = (
    transactions: ReadonlyArray<Transaction>,
    transactionTotal: Option<number>
  ) => {
    return transactionTotal.fold(
      transactions.length > 0 && <EdgeBorderComponent />,
      total => {
        if (total > transactions.length) {
          return (
            <ButtonDefaultOpacity
              style={styles.moreButton}
              bordered={true}
              disabled={this.state.loadingMore}
              onPress={() => {
                this.setState({ loadingMore: true }, () =>
                  this.props.onLoadMoreTransactions()
                );
              }}
            >
              <Text>
                {I18n.t(
                  this.state.loadingMore
                    ? "wallet.transacionsLoadingMore"
                    : "wallet.transactionsLoadMore"
                )}
              </Text>
            </ButtonDefaultOpacity>
          );
        }
        return <EdgeBorderComponent />;
      }
    );
  };

  public render(): React.ReactNode {
    const { ListEmptyComponent } = this.props;

    // first loading
    if (
      this.state.loadingMore === false &&
      pot.isLoading(this.props.transactions)
    ) {
      return (
        <BoxedRefreshIndicator
          white={true}
          caption={<Text>{I18n.t("wallet.transactionsLoadMessage")}</Text>}
        />
      );
    }
    const transactions: ReadonlyArray<Transaction> = pot.getOrElse(
      this.props.transactions,
      []
    );
    const transactionsTotal: Option<number> = pot.toOption(
      this.props.transactionsTotal
    );
    return transactions.length === 0 && ListEmptyComponent ? (
      ListEmptyComponent
    ) : (
      <Content scrollEnabled={false} style={styles.whiteContent}>
        <View>
          <View style={styles.subHeaderContent}>
            <H5 style={styles.brandDarkGray}>
              {I18n.t("wallet.latestTransactions")}
            </H5>
            <Text>{I18n.t("wallet.amount")}</Text>
          </View>
        </View>
        <FlatList
          scrollEnabled={false}
          data={transactions}
          renderItem={this.renderTransaction}
          ItemSeparatorComponent={() => (
            <ItemSeparatorComponent noPadded={true} />
          )}
          keyExtractor={item => item.id.toString()}
          ListFooterComponent={this.footerListComponent(
            transactions,
            transactionsTotal
          )}
        />
      </Content>
    );
  }
}
