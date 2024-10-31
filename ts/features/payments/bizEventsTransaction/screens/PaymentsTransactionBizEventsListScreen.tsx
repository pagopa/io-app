import {
  ButtonLink,
  Divider,
  H2,
  IOStyles,
  ListItemHeader,
  ListItemTransaction,
  VSpacer
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
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import Placeholder from "rn-placeholder";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentsTransactionBizEventsParamsList } from "../navigation/params";
import { getPaymentsBizEventsTransactionsAction } from "../store/actions";
import { walletTransactionBizEventsListPotSelector } from "../store/selectors";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { isPaymentsTransactionsEmptySelector } from "../../home/store/selectors";
import { PaymentsBizEventsListItemTransaction } from "../components/PaymentsBizEventsListItemTransaction";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { groupTransactionsByMonth } from "../utils";
import I18n from "../../../../i18n";
import { PaymentsTransactionBizEventsRoutes } from "../navigation/routes";
import { PaymentsTransactionRoutes } from "../../transaction/navigation/routes";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import * as analytics from "../analytics";
import { PaymentsBizEventsFilterTabs } from "../components/PaymentsBizEventsFilterTabs";
import { PaymentBizEventsCategoryFilter } from "../types";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

export type PaymentsTransactionBizEventsListScreenProps = RouteProp<
  PaymentsTransactionBizEventsParamsList,
  "PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS"
>;

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList as new () => SectionList<NoticeListItem>
);

const PaymentsTransactionBizEventsListScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const scrollTranslationY = useSharedValue(0);
  const [titleHeight, setTitleHeight] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [continuationToken, setContinuationToken] = React.useState<
    string | undefined
  >();
  const [noticeCategory, setNoticeCategory] =
    React.useState<PaymentBizEventsCategoryFilter>("all");
  const [groupedTransactions, setGroupedTransactions] =
    React.useState<ReadonlyArray<SectionListData<NoticeListItem>>>();
  const insets = useSafeAreaInsets();

  const transactionsPot = useIOSelector(
    walletTransactionBizEventsListPotSelector
  );
  const isEmpty = useIOSelector(isPaymentsTransactionsEmptySelector);

  const isLoading = pot.isLoading(transactionsPot);

  const handleNavigateToTransactionDetails = (transaction: NoticeListItem) => {
    if (transaction.eventId === undefined) {
      return;
    }
    navigation.navigate(
      PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR,
      {
        screen:
          PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS,
        params: {
          transactionId: transaction.eventId,
          isPayer: transaction.isPayer
        }
      }
    );
  };

  const handleNavigateToLegacyTransactions = () => {
    analytics.trackPaymentsOpenOldReceiptListing("payments_receipt_listing");
    navigation.navigate(
      PaymentsTransactionRoutes.PAYMENT_TRANSACTION_NAVIGATOR,
      {
        screen: PaymentsTransactionRoutes.PAYMENT_TRANSACTION_LIST
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

  const handleOnSuccess = (paginationToken?: string) => {
    setContinuationToken(paginationToken);
    setIsRefreshing(false);
  };

  const handleOnRefreshTransactionsList = () => {
    setIsRefreshing(true);
    dispatch(
      getPaymentsBizEventsTransactionsAction.request({
        firstLoad: true,
        noticeCategory,
        onSuccess: handleOnSuccess
      })
    );
  };

  const handleCategorySelected = (category: PaymentBizEventsCategoryFilter) => {
    setNoticeCategory(category);
    dispatch(
      getPaymentsBizEventsTransactionsAction.request({
        firstLoad: true,
        noticeCategory: category,
        onSuccess: handleOnSuccess
      })
    );
  };

  useOnFirstRender(
    React.useCallback(() => {
      analytics.trackPaymentsReceiptListing();
      dispatch(
        getPaymentsBizEventsTransactionsAction.request({
          firstLoad: true,
          onSuccess: handleOnSuccess
        })
      );
    }, [dispatch])
  );

  React.useEffect(() => {
    if (pot.isSome(transactionsPot)) {
      setGroupedTransactions(groupTransactionsByMonth(transactionsPot.value));
    }
  }, [transactionsPot]);

  useHeaderSecondLevel({
    title: I18n.t("features.payments.transactions.title"),
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
      <VSpacer size={16} />
      <PaymentsBizEventsFilterTabs
        selectedCategory={noticeCategory}
        onCategorySelected={handleCategorySelected}
      />
    </View>
  );

  const ShowLegacyTransactionsButton = () => (
    <View style={{ marginTop: 12 }}>
      <VSpacer size={16} />
      <ButtonLink
        label={I18n.t("features.payments.transactions.showLegacyTransactions")}
        onPress={handleNavigateToLegacyTransactions}
        icon="history"
      />
    </View>
  );

  const renderLoadingFooter = () => (
    <>
      {isLoading && (
        <>
          {!continuationToken && (
            <>
              <VSpacer size={16} />
              <Placeholder.Box
                animate="fade"
                radius={8}
                width={62}
                height={16}
              />
              <VSpacer size={16} />
            </>
          )}

          {Array.from({ length: 5 }).map((_, index) => (
            <TransactionFadeInOutAnimationView key={index}>
              <ListItemTransaction
                isLoading={true}
                transactionStatus="success"
                transactionAmount=""
                title=""
                subtitle=""
              />
            </TransactionFadeInOutAnimationView>
          ))}
        </>
      )}
      {!isLoading && !continuationToken && noticeCategory === "all" && (
        <ShowLegacyTransactionsButton />
      )}
    </>
  );

  const EmptyStateList = isEmpty ? (
    <TransactionFadeInOutAnimationView>
      <OperationResultScreenContent
        isHeaderVisible
        title={I18n.t("features.payments.transactions.list.empty.title")}
        subtitle={I18n.t("features.payments.transactions.list.empty.subtitle")}
        pictogram="emptyArchive"
      />
    </TransactionFadeInOutAnimationView>
  ) : undefined;

  const fetchNextPage = () => {
    if (!continuationToken || isLoading) {
      return;
    }
    dispatch(
      getPaymentsBizEventsTransactionsAction.request({
        noticeCategory,
        continuationToken,
        onSuccess: handleOnSuccess
      })
    );
  };

  return (
    <AnimatedSectionList
      refreshing={isRefreshing}
      onRefresh={handleOnRefreshTransactionsList}
      scrollIndicatorInsets={{ right: 0 }}
      contentContainerStyle={{
        ...IOStyles.horizontalContentPadding,
        minHeight: isEmpty ? "100%" : undefined,
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
      ItemSeparatorComponent={Divider}
      renderSectionHeader={({ section }) => (
        <ListItemHeader label={section.title} />
      )}
      ListEmptyComponent={EmptyStateList}
      ListFooterComponent={renderLoadingFooter}
      keyExtractor={item => `transaction_${item.eventId}`}
      renderItem={({ item }) => (
        <TransactionFadeInOutAnimationView>
          <PaymentsBizEventsListItemTransaction
            onPress={() => handleNavigateToTransactionDetails(item)}
            transaction={item}
          />
        </TransactionFadeInOutAnimationView>
      )}
    />
  );
};

const TransactionFadeInOutAnimationView = React.memo(
  ({ children }: { children: React.ReactNode }) => (
    <Animated.View
      style={IOStyles.flex}
      exiting={FadeOut.duration(200)}
      entering={FadeIn.duration(200)}
    >
      {children}
    </Animated.View>
  ),
  () => true
);

export { PaymentsTransactionBizEventsListScreen };
