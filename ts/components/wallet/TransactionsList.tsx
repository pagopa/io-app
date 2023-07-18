import * as pot from "@pagopa/ts-commons/lib/pot";
import { Content, Text as NBButtonText } from "native-base";
import * as React from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View
} from "react-native";
import { formatNumberCurrencyCents } from "../../features/idpay/common/utils/strings";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { Transaction } from "../../types/pagopa";
import { format } from "../../utils/dates";
import { isImageUri } from "../../utils/url";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { Icon } from "../core/icons";
import { Body } from "../core/typography/Body";
import { H3 } from "../core/typography/H3";
import { IOColors } from "../core/variables/IOColors";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import BoxedRefreshIndicator from "../ui/BoxedRefreshIndicator";
import { ListItemTransaction } from "../ui/ListItemTransaction";

type Props = Readonly<{
  title: string;
  transactions: pot.Pot<ReadonlyArray<Transaction>, Error>;
  areMoreTransactionsAvailable: boolean;
  onLoadMoreTransactions: () => void;
  navigateToTransactionDetails: (transaction: Transaction) => void;
  helpMessage?: React.ReactNode;
  ListEmptyComponent?: React.ReactElement;
}>;
const screenWidth = Dimensions.get("screen").width;

const MunicipalityPlaceholder = () => (
  <View style={styles.municipalityPlaceholder}>
    <Icon color="grey-450" name="institution" size={"100%"} />
  </View>
);

export const TransactionsList = (props: Props) => {
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const {
    ListEmptyComponent,
    areMoreTransactionsAvailable,
    onLoadMoreTransactions,
    helpMessage
  } = props;

  React.useEffect(() => {
    if (
      isLoadingMore &&
      (pot.isSome(props.transactions) || pot.isError(props.transactions))
    ) {
      setIsLoadingMore(false);
    }
  }, [props.transactions, isLoadingMore]);

  const transactions: ReadonlyArray<Transaction> = pot.getOrElse(
    props.transactions,
    []
  );

  // ------------------ loading guard ------------------
  if (!isLoadingMore && pot.isLoading(props.transactions)) {
    return (
      <BoxedRefreshIndicator
        white={true}
        caption={<Body>{I18n.t("wallet.transactionsLoadMessage")}</Body>}
      />
    );
  }

  // ------------------ components + utils ------------------

  const shouldShowFooterComponent = (
    ListEmptyComponent?: React.ReactElement
  ): ListEmptyComponent is React.ReactElement =>
    transactions.length === 0 &&
    !areMoreTransactionsAvailable &&
    ListEmptyComponent !== undefined;

  const footerListComponent = (transactions: ReadonlyArray<Transaction>) => {
    if (!areMoreTransactionsAvailable) {
      return transactions.length > 0 && <EdgeBorderComponent />;
    }

    return (
      <View>
        <ButtonDefaultOpacity
          style={styles.moreButton}
          bordered={true}
          disabled={isLoadingMore}
          onPress={() => {
            setIsLoadingMore(true);
            onLoadMoreTransactions();
          }}
        >
          <NBButtonText>
            {I18n.t(
              // change the button text if we are loading another slice of transactions
              isLoadingMore
                ? "wallet.transacionsLoadingMore"
                : "wallet.transactionsLoadMore"
            )}
          </NBButtonText>
        </ButtonDefaultOpacity>
        <EdgeBorderComponent />
      </View>
    );
  };

  const renderTransaction = (info: ListRenderItemInfo<Transaction>) => {
    const item = info.item;
    const recipient = item.merchant;

    const amount = formatNumberCurrencyCents(item.amount.amount);
    const datetime: string = format(item.created, "DD MMM YYYY, HH:mm");
    const recipientLogo = isImageUri(recipient) ? (
      recipient
    ) : (
      <MunicipalityPlaceholder />
    );
    return (
      <ListItemTransaction
        paymentLogoIcon={recipientLogo}
        title={recipient}
        subtitle={datetime}
        onPress={() => props.navigateToTransactionDetails(item)}
        transactionStatus="success"
        transactionAmount={amount}
      />
    );
  };

  // ------------------ render ------------------
  /**
   * 1 - if more transaction are available to load, show the load more button
   * 2 - if all transactions are loaded, show end list component
   */
  return shouldShowFooterComponent(ListEmptyComponent) ? (
    ListEmptyComponent
  ) : (
    <Content scrollEnabled={false} style={styles.whiteContent}>
      <View>
        <View style={styles.subHeaderContent}>
          <H3 weight={"SemiBold"} color={"bluegreyDark"}>
            {I18n.t("wallet.latestTransactions")}
          </H3>
        </View>
      </View>
      {helpMessage}
      <FlatList
        scrollEnabled={false}
        data={transactions}
        renderItem={renderTransaction}
        ItemSeparatorComponent={() => (
          <ItemSeparatorComponent noPadded={true} />
        )}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={footerListComponent(transactions)}
      />
    </Content>
  );
};

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
  },
  municipalityPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: IOColors["grey-100"],
    justifyContent: "center",
    alignItems: "center",
    padding: 6
  }
});
