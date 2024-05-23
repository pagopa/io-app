import {
  Banner,
  H2,
  IOStyles,
  ListItemTransaction,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp } from "@react-navigation/native";
import * as React from "react";
import { FlatList, LayoutChangeEvent, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PaymentsTransactionParamsList } from "../navigation/params";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import I18n from "../../../../i18n";
import { PaymentsTransactionRoutes } from "../navigation/routes";
import {
  areMoreTransactionsAvailable,
  getTransactionsLoadedLength,
  latestTransactionsSelector
} from "../../../../store/reducers/wallet/transactions";
import { isPaymentsLegacyTransactionsEmptySelector } from "../store/selectors";
import { fetchTransactionsRequestWithExpBackoff } from "../../../../store/actions/wallet/transactions";
import { Transaction } from "../../../../types/pagopa";
import { PaymentsLegacyListItemTransaction } from "../components/PaymentsLegacyListItemTransaction";
import { usePaymentsLegacyAttachmentBottomSheet } from "../components/PaymentsLegacyAttachmentBottomSheet";
import { PaymentsLegacyTransactionsEmptyContent } from "../components/PaymentsLegacyTransactionsEmptyContent";

export type PaymentsTransactionListScreenProps = RouteProp<
  PaymentsTransactionParamsList,
  "PAYMENT_TRANSACTION_LIST"
>;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList as new () => FlatList<Transaction>
);

const PaymentsTransactionListScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const scrollTranslationY = useSharedValue(0);
  const [titleHeight, setTitleHeight] = React.useState(0);
  const insets = useSafeAreaInsets();

  const transactionsPot = useIOSelector(latestTransactionsSelector);
  const isEmpty = useIOSelector(isPaymentsLegacyTransactionsEmptySelector);
  const moreTransactionsAvailable = useIOSelector(areMoreTransactionsAvailable);
  const transactionsLoadedLength = useIOSelector(getTransactionsLoadedLength);

  const { bottomSheet, present: presentLegacyAttachmentBottomSheet } =
    usePaymentsLegacyAttachmentBottomSheet();

  const isLoading = pot.isLoading(transactionsPot);

  const handleNavigateToTransactionDetails = (transaction: Transaction) => {
    navigation.navigate(
      PaymentsTransactionRoutes.PAYMENT_TRANSACTION_NAVIGATOR,
      {
        screen: PaymentsTransactionRoutes.PAYMENT_TRANSACTION_DETAILS,
        params: {
          transactionId: transaction.id
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
      dispatch(fetchTransactionsRequestWithExpBackoff({ start: 0 }));
    }, [dispatch])
  );

  useHeaderSecondLevel({
    title: I18n.t("features.payments.transactions.legacy.title"),
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
        accessibilityLabel={I18n.t(
          "features.payments.transactions.legacy.title"
        )}
        accessibilityRole="header"
      >
        {I18n.t("features.payments.transactions.legacy.title")}
      </H2>
      <VSpacer size={16} />
      {!isEmpty && (
        <>
          <Banner
            content={I18n.t(
              "features.payments.transactions.legacy.banner.content"
            )}
            action={I18n.t(
              "features.payments.transactions.legacy.banner.action"
            )}
            onPress={presentLegacyAttachmentBottomSheet}
            color="neutral"
            pictogramName="activate"
            size="big"
          />
          <VSpacer size={16} />
        </>
      )}
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

  const fetchNextPage = () => {
    if (!moreTransactionsAvailable || isLoading) {
      return;
    }
    dispatch(
      fetchTransactionsRequestWithExpBackoff({
        start: transactionsLoadedLength
      })
    );
  };

  return (
    <>
      <AnimatedFlatList
        scrollIndicatorInsets={{ right: 0 }}
        contentContainerStyle={{
          ...IOStyles.horizontalContentPadding,
          paddingBottom: insets.bottom + 24,
          flexGrow: 1
        }}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.25}
        ListHeaderComponent={SectionListHeaderTitle}
        onScroll={scrollHandler}
        data={pot.isSome(transactionsPot) ? transactionsPot.value : []}
        testID="PaymentsTransactionsListTestID"
        ListFooterComponent={renderLoadingFooter}
        ListEmptyComponent={
          !isLoading ? (
            <PaymentsLegacyTransactionsEmptyContent withPictogram={true} />
          ) : undefined
        }
        keyExtractor={item => `transaction_${item.id}`}
        renderItem={({ item }) => (
          <PaymentsLegacyListItemTransaction
            onPressTransaction={() => handleNavigateToTransactionDetails(item)}
            transaction={item}
          />
        )}
      />
      {bottomSheet}
    </>
  );
};

export { PaymentsTransactionListScreen };
