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
import { groupTransactionsByMonth } from "../utils";
import I18n from "../../../../i18n";

export type PaymentsTransactionListScreenProps = RouteProp<
  PaymentsTransactionParamsList,
  "PAYMENT_TRANSACTION_LIST_SCREEN"
>;

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList as new () => SectionList<TransactionListItem>
);

const PaymentsTransactionListScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const scrollTranslationY = useSharedValue(0);
  const [titleHeight, setTitleHeight] = React.useState(0);
  const [continuationToken, setContinuationToken] = React.useState<
    string | undefined
  >();
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

  const handleOnSuccess = (continuationToken?: string) => {
    setContinuationToken(continuationToken);
  };

  useOnFirstRender(
    React.useCallback(() => {
      dispatch(
        getPaymentsTransactionsAction.request({
          firstLoad: true,
          onSuccess: handleOnSuccess
        })
      );
    }, [dispatch])
  );

  // creami un hook che quando cambia il valore di transactionPot, aggiorna uno stato creando un array di elementi raggruppati per mese e
  // l'array deve essere composto da {title: "mese", data: [transazioni]}
  React.useEffect(() => {
    if (pot.isSome(transactionsPot)) {
      setGroupedTransactions(groupTransactionsByMonth(transactionsPot.value));
    }
  }, [transactionsPot]);

  useHeaderSecondLevel({
    title: I18n.t("features.payments.transactions.title"),
    canGoBack: true,
    supportRequest: true,
    scrollValues: {
      contentOffsetY: scrollTranslationY,
      triggerOffset: titleHeight
    }
  });

  const SectionListHeaderTitle = (
    <View onLayout={getTitleHeight}>
      <H2
        accessibilityLabel={I18n.t("features.payments.transactions.title")}
        accessibilityRole="header"
      >
        {I18n.t("features.payments.transactions.title")}
      </H2>
    </View>
  );

  const renderLoadingFooter = () => (
    <>
      {isLoading &&
        Array.from({ length: 5 }).map((_, index) => (
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

  const fetchNextPage = () => {
    if (!continuationToken || isLoading) {
      return;
    }
    dispatch(
      getPaymentsTransactionsAction.request({
        continuationToken,
        onSuccess: handleOnSuccess
      })
    );
  };

  return (
    <AnimatedSectionList
      // snapToEnd={false}
      scrollIndicatorInsets={{ right: 0 }}
      contentContainerStyle={{
        ...IOStyles.horizontalContentPadding,
        paddingBottom: insets.bottom + 24
      }}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.25}
      ListHeaderComponent={SectionListHeaderTitle}
      onScroll={scrollHandler}
      stickySectionHeadersEnabled={false}
      sections={
        pot.isSome(transactionsPot) && groupedTransactions
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
