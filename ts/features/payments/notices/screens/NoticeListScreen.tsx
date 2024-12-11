import {
  Divider,
  IOStyles,
  ListItemHeader
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp } from "@react-navigation/native";
import * as React from "react";
import { LayoutChangeEvent, SectionList, SectionListData } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentsNoticeParamsList } from "../navigation/params";
import { getPaymentsNoticeAction } from "../store/actions";
import { walletNoticeListPotSelector } from "../store/selectors";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { isPaymentsTransactionsEmptySelector } from "../../home/store/selectors";
import { NoticeListItemTransaction } from "../components/NoticeListItemTransaction";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { groupTransactionsByMonth } from "../utils";
import I18n from "../../../../i18n";
import { PaymentsNoticeRoutes } from "../navigation/routes";
import { NoticeListItem } from "../../../../../definitions/pagopa/biz-events/NoticeListItem";
import * as analytics from "../analytics";
import { NoticeEventsCategoryFilter } from "../types";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { NoticeFadeInOutAnimationView } from "../components/NoticeFadeInOutAnimationView";
import { NoticeLoadingList } from "../components/NoticeLoadingList";
import { NoticeSectionListHeader } from "../components/NoticeSectionListHeader";

export type PaymentsNoticeListScreenProps = RouteProp<
  PaymentsNoticeParamsList,
  "PAYMENT_NOTICE_DETAILS"
>;

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList as new () => SectionList<NoticeListItem>
);

const PaymentsNoticeListScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const scrollTranslationY = useSharedValue(0);
  const [titleHeight, setTitleHeight] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [continuationToken, setContinuationToken] = React.useState<
    string | undefined
  >();
  const [noticeCategory, setNoticeCategory] =
    React.useState<NoticeEventsCategoryFilter>("all");
  const [groupedTransactions, setGroupedTransactions] =
    React.useState<ReadonlyArray<SectionListData<NoticeListItem>>>();
  const insets = useSafeAreaInsets();

  const transactionsPot = useIOSelector(walletNoticeListPotSelector);
  const isEmpty = useIOSelector(isPaymentsTransactionsEmptySelector);

  const isLoading = pot.isLoading(transactionsPot);

  const handleNavigateToTransactionDetails = (transaction: NoticeListItem) => {
    if (transaction.eventId === undefined) {
      return;
    }
    navigation.navigate(PaymentsNoticeRoutes.PAYMENT_NOTICE_NAVIGATOR, {
      screen: PaymentsNoticeRoutes.PAYMENT_NOTICE_DETAILS,
      params: {
        transactionId: transaction.eventId,
        isPayer: transaction.isPayer
      }
    });
  };

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = contentOffset.y;
  });

  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  const fetchNextPage = () => {
    if (!continuationToken || isLoading) {
      return;
    }
    dispatch(
      getPaymentsNoticeAction.request({
        noticeCategory,
        continuationToken,
        onSuccess: handleOnSuccess
      })
    );
  };

  const handleOnSuccess = (paginationToken?: string) => {
    setContinuationToken(paginationToken);
    setIsRefreshing(false);
  };

  const handleOnRefreshTransactionsList = () => {
    setIsRefreshing(true);
    dispatch(
      getPaymentsNoticeAction.request({
        firstLoad: true,
        noticeCategory,
        onSuccess: handleOnSuccess
      })
    );
  };

  const handleCategorySelected = React.useCallback(
    (category: NoticeEventsCategoryFilter) => {
      setNoticeCategory(category);
      dispatch(
        getPaymentsNoticeAction.request({
          firstLoad: true,
          noticeCategory: category,
          onSuccess: handleOnSuccess
        })
      );
    },
    [setNoticeCategory, dispatch]
  );

  useOnFirstRender(
    React.useCallback(() => {
      analytics.trackPaymentsReceiptListing();
      dispatch(
        getPaymentsNoticeAction.request({
          firstLoad: true,
          onSuccess: handleOnSuccess
        })
      );
    }, [dispatch])
  );

  useHeaderSecondLevel({
    title: I18n.t("features.payments.transactions.title"),
    supportRequest: true,
    scrollValues: {
      contentOffsetY: scrollTranslationY,
      triggerOffset: titleHeight
    }
  });

  React.useEffect(() => {
    if (pot.isSome(transactionsPot)) {
      setGroupedTransactions(groupTransactionsByMonth(transactionsPot.value));
    }
  }, [transactionsPot]);

  const renderLoadingFooter = () => (
    <>
      {isLoading && (
        <NoticeLoadingList showSectionTitleSkeleton={!continuationToken} />
      )}
    </>
  );

  const EmptyStateList = isEmpty ? (
    <NoticeFadeInOutAnimationView>
      <OperationResultScreenContent
        isHeaderVisible
        title={I18n.t("features.payments.transactions.list.empty.title")}
        subtitle={I18n.t("features.payments.transactions.list.empty.subtitle")}
        pictogram="emptyArchive"
      />
    </NoticeFadeInOutAnimationView>
  ) : undefined;

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
      ListHeaderComponent={
        <NoticeSectionListHeader
          onLayout={getTitleHeight}
          selectedCategory={noticeCategory}
          onCategorySelected={handleCategorySelected}
        />
      }
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
        <NoticeFadeInOutAnimationView>
          <NoticeListItemTransaction
            onPress={() => handleNavigateToTransactionDetails(item)}
            transaction={item}
          />
        </NoticeFadeInOutAnimationView>
      )}
    />
  );
};

export { PaymentsNoticeListScreen };
