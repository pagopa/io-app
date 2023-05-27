/**
 * This component displays a list of transactions
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Content, Text as NBButtonText } from "native-base";
import * as React from "react";
import {
  View,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet
} from "react-native";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import {
  dateToAccessibilityReadableFormat,
  hoursAndMinutesToAccessibilityReadableFormat
} from "../../utils/accessibility";
import { formatDateAsLocal } from "../../utils/dates";
import { cleanTransactionDescription } from "../../utils/payment";
import { formatNumberCentsToAmount } from "../../utils/stringBuilder";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { Body } from "../core/typography/Body";
import { H3 } from "../core/typography/H3";
import { IOColors } from "../core/variables/IOColors";
import DetailedlistItemComponent from "../DetailedlistItemComponent";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";

type State = {
  loadingMore: boolean;
};

type Props = Readonly<{
  title: string;
  amount: string;
  transactions: pot.Pot<ReadonlyArray<Transaction>, Error>;
  areMoreTransactionsAvailable: boolean;
  onLoadMoreTransactions: () => void;
  navigateToTransactionDetails: (transaction: Transaction) => void;
  helpMessage?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
}>;
const screenWidth = Dimensions.get("screen").width;
const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: IOColors.white,
    flex: 1
  },
  subHeaderContent: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  moreButton: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: screenWidth - variables.contentPadding * 2,
    backgroundColor: IOColors.white
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
    // loading more transaction is complete (or we got an error), revert the state
    if (
      prevState.loadingMore &&
      pot.isLoading(prevProps.transactions) &&
      (pot.isSome(this.props.transactions) ||
        pot.isError(this.props.transactions))
    ) {
      this.setState({ loadingMore: false });
    }
  }

  private renderTransaction = (info: ListRenderItemInfo<Transaction>) => {
    const item = info.item;
    const paymentReason = cleanTransactionDescription(item.description);
    const recipient = item.merchant;

    const amount = formatNumberCentsToAmount(item.amount.amount);
    const datetime: string = `${formatDateAsLocal(
      item.created,
      true,
      true
    )} - ${item.created.toLocaleTimeString()}`;
    return (
      <DetailedlistItemComponent
        isNew={false}
        text11={recipient}
        text12={amount}
        text2={datetime}
        text3={paymentReason}
        onPressItem={() => this.props.navigateToTransactionDetails(item)}
        accessible={true}
        accessibilityRole={"button"}
        accessibilityLabel={I18n.t(
          "wallet.accessibility.transactionListItem.label",
          {
            payment: I18n.t(
              "wallet.accessibility.transactionListItem.payment.read"
            ),
            merchant: recipient,
            amount,
            datetime: dateToAccessibilityReadableFormat(item.created),
            hours: hoursAndMinutesToAccessibilityReadableFormat(item.created),
            reason: paymentReason
          }
        )}
      />
    );
  };

  /**
   * 1 - if more transaction are available to load, show the load more button
   * 2 - if all transactions are loaded, show end list component
   */
  private footerListComponent = (transactions: ReadonlyArray<Transaction>) => {
    if (!this.props.areMoreTransactionsAvailable) {
      return transactions.length > 0 && <EdgeBorderComponent />;
    }

    return (
      <View>
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
          <NBButtonText>
            {I18n.t(
              // change the button text if we are loading another slice of transactions
              this.state.loadingMore
                ? "wallet.transacionsLoadingMore"
                : "wallet.transactionsLoadMore"
            )}
          </NBButtonText>
        </ButtonDefaultOpacity>
        <EdgeBorderComponent />
      </View>
    );
  };

  public render(): React.ReactNode {
    const { ListEmptyComponent } = this.props;
    // first loading
    if (!this.state.loadingMore && pot.isLoading(this.props.transactions)) {
      return (
        <BoxedRefreshIndicator
          white={true}
          caption={<Body>{I18n.t("wallet.transactionsLoadMessage")}</Body>}
        />
      );
    }
    const transactions: ReadonlyArray<Transaction> = pot.getOrElse(
      this.props.transactions,
      []
    );
    return transactions.length === 0 &&
      !this.props.areMoreTransactionsAvailable &&
      ListEmptyComponent ? (
      ListEmptyComponent
    ) : (
      <Content scrollEnabled={false} style={styles.whiteContent}>
        <View>
          <View style={styles.subHeaderContent}>
            <H3 weight={"SemiBold"} color={"bluegreyDark"}>
              {I18n.t("wallet.latestTransactions")}
            </H3>
            <Body>{I18n.t("wallet.amount")}</Body>
          </View>
        </View>
        {this.props.helpMessage}
        <FlatList
          scrollEnabled={false}
          data={transactions}
          renderItem={this.renderTransaction}
          ItemSeparatorComponent={() => (
            <ItemSeparatorComponent noPadded={true} />
          )}
          keyExtractor={item => item.id.toString()}
          ListFooterComponent={this.footerListComponent(transactions)}
        />
      </Content>
    );
  }
}
