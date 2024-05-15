import {
  H2,
  IOStyles,
  ListItemHeader,
  ListItemTransaction
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp } from "@react-navigation/native";
import * as React from "react";
import {
  LayoutChangeEvent,
  SectionList,
  SectionListData,
  View
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentsTransactionParamsList } from "../navigation/params";
import { getPaymentsTransactionsAction } from "../store/actions";
import { walletTransactionsListPotSelector } from "../store/selectors";
import { TransactionListItem } from "../../../../../definitions/pagopa/biz-events/TransactionListItem";
import { PaymentsTransactionRoutes } from "../navigation/routes";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { isPaymentsTransactionsEmptySelector } from "../../home/store/selectors";
import { PaymentsBizEventsListItemTransaction } from "../../home/components/PaymentsBizEventsListItemTransaction";
import { PaymentsHomeEmptyScreenContent } from "../../home/components/PaymentsHomeEmptyScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";

export type PaymentsTransactionListScreenProps = RouteProp<
  PaymentsTransactionParamsList,
  "PAYMENT_TRANSACTION_LIST_SCREEN"
>;

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList as new () => SectionList<TransactionListItem>
);

/**
 * Function that groups the transactions by month and returns an array of objects with the month as title and the transactions as data
 * - The year is shown only if it's different from the current year
 */
const groupByMonth = (
  elements: ReadonlyArray<TransactionListItem>
): Array<SectionListData<TransactionListItem>> => {
  const groups: { [month: string]: Array<TransactionListItem> } = {};

  elements.forEach(element => {
    if (element.transactionDate !== undefined) {
      const month = new Date(element.transactionDate).toLocaleString(
        "default",
        {
          month: "long",
          year:
            new Date().getFullYear() ===
            new Date(element.transactionDate).getFullYear()
              ? undefined
              : "numeric"
        }
      );

      // eslint-disable-next-line functional/immutable-data
      groups[month] = groups[month] || [];
      // eslint-disable-next-line functional/immutable-data
      groups[month].push(element);
    }
  });

  return Object.keys(groups).map(month => ({
    title: month,
    data: groups[month]
  }));
};

const PaymentsTransactionListScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const scrollTranslationY = useSharedValue(0);
  const [titleHeight, setTitleHeight] = React.useState(0);
  const [groupedTransactions, setGroupedTransactions] =
    React.useState<ReadonlyArray<SectionListData<TransactionListItem>>>();
  const insets = useSafeAreaInsets();

  const transactionsPot = useIOSelector(walletTransactionsListPotSelector);
  const isEmpty = useIOSelector(isPaymentsTransactionsEmptySelector);

  const isLoading = pot.isLoading(transactionsPot);

  const handleNavigateToTransactionDetails = (
    transaction: TransactionListItem
  ) => {
    navigation.navigate(
      PaymentsTransactionRoutes.PAYMENT_TRANSACTION_NAVIGATOR,
      {
        screen: PaymentsTransactionRoutes.PAYMENT_TRANSACTION_DETAILS,
        params: {
          transactionId: 2
        }
      }
    );
  };

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = contentOffset.y;
  });

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  useOnFirstRender(
    React.useCallback(() => {
      if (pot.isNone(transactionsPot)) {
        dispatch(getPaymentsTransactionsAction.request({}));
      }
    }, [dispatch, transactionsPot])
  );

  // creami un hook che quando cambia il valore di transactionPot, aggiorna uno stato creando un array di elementi raggruppati per mese e
  // l'array deve essere composto da {title: "mese", data: [transazioni]}
  React.useEffect(() => {
    if (pot.isSome(transactionsPot)) {
      setGroupedTransactions(groupByMonth(transactionsPot.value));
    }
  }, [transactionsPot]);

  useHeaderSecondLevel({
    title: "Ricevute pagoPA",
    canGoBack: true,
    supportRequest: true,
    scrollValues: {
      contentOffsetY: scrollTranslationY,
      triggerOffset: titleHeight
    }
  });

  const SectionListHeaderTitle = (
    <View onLayout={getTitleHeight}>
      <H2 accessibilityLabel={"Ricevute pagoPA"} accessibilityRole="header">
        Ricevute pagoPA
      </H2>
    </View>
  );

  const renderLoadingFooter = () => (
    <>
      {isLoading &&
        Array.from({ length: 10 }).map((_, index) => (
          <ListItemTransaction
            isLoading={true}
            key={index}
            transactionStatus="success"
            transactionAmount=""
            title=""
            subtitle=""
          />
        ))}
    </>
  );

  if (isEmpty) {
    return <PaymentsHomeEmptyScreenContent withPictogram={true} />;
  }

  return (
    <AnimatedSectionList
      snapToEnd={false}
      scrollIndicatorInsets={{ right: 0 }}
      contentContainerStyle={{
        flexGrow: 1,
        ...IOStyles.horizontalContentPadding,
        paddingBottom: insets.bottom
      }}
      ListHeaderComponent={SectionListHeaderTitle}
      onScroll={scrollHandler}
      stickySectionHeadersEnabled={false}
      sections={
        pot.isSome(transactionsPot) && !isLoading && groupedTransactions
          ? groupedTransactions
          : []
      }
      testID="PaymentsTransactionsListTestID"
      renderSectionHeader={({ section }) => (
        <ListItemHeader label={section.title} />
      )}
      ListFooterComponent={renderLoadingFooter}
      keyExtractor={item => `transaction_${item.transactionId}`}
      renderItem={({ item }) => (
        <PaymentsBizEventsListItemTransaction
          onPress={() => handleNavigateToTransactionDetails(item)}
          transaction={item}
        />
      )}
    />
  );
};

export { PaymentsTransactionListScreen };
