import {
  IODimensions,
  IOIcons,
  TabItem,
  TabNavigation,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { cgnFeaturedOpportunitiesSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import CgnAnimatedHeader from "../../components/CgnAnimatedHeader";
import {
  CgnFeaturedOpportunities,
  CgnFeaturedOpportunitiesSkeleton
} from "../../components/merchants/CgnFeaturedOpportunities";
import { useDisableRootNavigatorGesture } from "../../hooks/useDisableRootNavigatorGesture";
import CGN_ROUTES from "../../navigation/routes";
import {
  cgnFeaturedOpportunities,
  cgnSelectedMerchant,
  resetMerchantDiscountCode,
  selectMerchantDiscount
} from "../../store/actions/merchants";
import {
  isLoadingFeaturedOpportunitiesSelector,
  resolvedCgnFeaturedOpportunitiesSelector
} from "../../store/selectors/featuredOpportunities";
import {
  CategoryRow,
  CgnMerchantCategoriesListScreen
} from "./CgnMerchantCategoriesListScreen";
import { CgnMerchantsListScreen, MerchantsAll } from "./CgnMerchantsListScreen";

export const CgnMerchantsHomeTabRoutes = {
  CGN_CATEGORIES: "CGN_CATEGORIES",
  CGN_MERCHANTS_ALL: "CGN_MERCHANTS_ALL"
} as const;

type CgnMerchantsHomeTabParamsList = {
  [CgnMerchantsHomeTabRoutes.CGN_CATEGORIES]: undefined;
  [CgnMerchantsHomeTabRoutes.CGN_MERCHANTS_ALL]: undefined;
};

type CgnMerchantsListItem = CategoryRow | MerchantsAll;

type TabOption = {
  icon: IOIcons;
  title: string;
};

const isCategoryRow = (item: CgnMerchantsListItem): item is CategoryRow =>
  "categories" in item;

const CgnMerchantsCategoriesSelectionScreen = () => {
  const { navigate } = useIONavigation();
  const dispatch = useIODispatch();
  const featuredReferences = useIOSelector(cgnFeaturedOpportunitiesSelector);
  const featuredOpportunities = useIOSelector(
    resolvedCgnFeaturedOpportunitiesSelector
  );
  const isFeaturedOpportunitiesLoading = useIOSelector(
    isLoadingFeaturedOpportunitiesSelector
  );

  useEffect(() => {
    dispatch(cgnFeaturedOpportunities.request(featuredReferences));
  }, [dispatch, featuredReferences]);
  useDisableRootNavigatorGesture();
  const { bottom } = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<
    keyof CgnMerchantsHomeTabParamsList
  >(CgnMerchantsHomeTabRoutes.CGN_CATEGORIES);

  const tabOptions: Record<keyof CgnMerchantsHomeTabParamsList, TabOption> = {
    [CgnMerchantsHomeTabRoutes.CGN_CATEGORIES]: {
      icon: "initiatives",
      title: I18n.t("bonus.cgn.merchantsList.tabs.perInitiative")
    },
    [CgnMerchantsHomeTabRoutes.CGN_MERCHANTS_ALL]: {
      icon: "merchant",
      title: I18n.t("bonus.cgn.merchantsList.tabs.perMerchant")
    }
  };

  const categoriesScreen = CgnMerchantCategoriesListScreen();
  const merchantsScreen = CgnMerchantsListScreen();

  const {
    data,
    refreshControlProps,
    ListFooterComponent,
    ListFooterComponentStyle,
    ListEmptyComponent,
    ItemSeparatorComponent
  } =
    selectedTab === CgnMerchantsHomeTabRoutes.CGN_CATEGORIES
      ? categoriesScreen
      : merchantsScreen;

  const tabRoutesKeys = Object.keys(CgnMerchantsHomeTabRoutes);

  const animatedFlatListRef =
    useAnimatedRef<Animated.FlatList<CgnMerchantsListItem>>();

  const rawScrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    rawScrollY.value = contentOffset.y;
  });

  // PULL_TRIGGER_DISTANCE approximates the iOS UIRefreshControl pull threshold
  const PULL_TRIGGER_DISTANCE = 80;
  const pullProgress = useDerivedValue(() =>
    Math.min(1, Math.max(0, -rawScrollY.value / PULL_TRIGGER_DISTANCE))
  );

  const isRefreshingSharedValue = useSharedValue(0);

  useHeaderSecondLevel({
    title: I18n.t("bonus.cgn.merchantsList.screenTitle"),
    enableDiscreteTransition: true,
    animatedRef: animatedFlatListRef,
    transparent: true,
    supportRequest: true,
    canGoBack: true,
    secondAction: {
      icon: "search",
      testID: "search-button",
      onPress() {
        navigate(CGN_ROUTES.DETAILS.MAIN, {
          screen: CGN_ROUTES.DETAILS.MERCHANTS.SEARCH
        });
      },
      accessibilityLabel: I18n.t(
        "bonus.cgn.merchantSearch.goToSearchAccessibilityLabel"
      )
    }
  });

  const [isPullRefresh, setIsPullRefresh] = useState(false);

  const isRefreshing =
    (refreshControlProps?.refreshing ?? false) && isPullRefresh;
  const contentContainerPaddingBottom = ListFooterComponentStyle
    ? 0
    : IODimensions.padding.screen.default + bottom;

  useEffect(() => {
    isRefreshingSharedValue.value = isRefreshing ? 1 : 0;
  }, [isRefreshing, isRefreshingSharedValue]);

  useEffect(() => {
    if (!refreshControlProps?.refreshing) {
      setIsPullRefresh(false);
    }
  }, [refreshControlProps?.refreshing]);

  const ListHeaderComponent = useMemo(
    () => (
      <>
        <CgnAnimatedHeader
          isRefreshingValue={isRefreshingSharedValue}
          pullProgress={pullProgress}
        />
        <View style={{ flexGrow: 0, flexShrink: 0 }}>
          <TabNavigation
            includeContentMargins={true}
            selectedIndex={tabRoutesKeys.indexOf(selectedTab)}
            tabAlignment="start"
          >
            {tabRoutesKeys.map((routeKey, index) => {
              const route = routeKey as keyof CgnMerchantsHomeTabParamsList;
              const onPress = () => setSelectedTab(route);

              const label = tabOptions[route].title;
              const accessibilityLabel = I18n.t(
                "bonus.cgn.merchantsList.tabs.a11y",
                {
                  label,
                  index: index + 1,
                  total: tabRoutesKeys.length
                }
              );
              return (
                <TabItem
                  accessibilityLabel={accessibilityLabel}
                  icon={tabOptions[route].icon}
                  key={route}
                  label={label}
                  onPress={onPress}
                  testID={`cgn-merchants-tab-${route}`}
                />
              );
            })}
          </TabNavigation>
        </View>
        <VSpacer size={16} />
        {selectedTab === CgnMerchantsHomeTabRoutes.CGN_CATEGORIES &&
          (featuredOpportunities.length > 0 ? (
            <View testID="CgnFeaturedOpportunitiesSection">
              <CgnFeaturedOpportunities
                onSelect={({ merchant, discount }) => {
                  dispatch(cgnSelectedMerchant.success(merchant));
                  dispatch(selectMerchantDiscount(discount));
                  dispatch(resetMerchantDiscountCode());
                  navigate(CGN_ROUTES.DETAILS.MAIN, {
                    screen: CGN_ROUTES.DETAILS.MERCHANTS.DISCOUNT
                  });
                }}
                opportunities={featuredOpportunities}
              />
              <VSpacer size={16} />
            </View>
          ) : (
            isFeaturedOpportunitiesLoading &&
            featuredReferences.length > 0 && (
              <>
                <CgnFeaturedOpportunitiesSkeleton />
                <VSpacer size={16} />
              </>
            )
          ))}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dispatch,
      featuredOpportunities,
      featuredReferences,
      isFeaturedOpportunitiesLoading,
      navigate,
      selectedTab
    ]
  );

  return (
    <Animated.FlatList<CgnMerchantsListItem>
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: contentContainerPaddingBottom
      }}
      data={data}
      ItemSeparatorComponent={ItemSeparatorComponent}
      keyExtractor={item => item.id}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ListFooterComponentStyle={ListFooterComponentStyle}
      ListHeaderComponent={ListHeaderComponent}
      onScroll={scrollHandler}
      ref={animatedFlatListRef}
      refreshControl={
        <RefreshControl
          // Hides the native spinner: `CgnAnimatedHeader` draws its own
          tintColor="transparent"
          {...refreshControlProps}
          onRefresh={() => {
            dispatch(cgnFeaturedOpportunities.request(featuredReferences));
            refreshControlProps.onRefresh();
            setIsPullRefresh(true);
          }}
          refreshing={isRefreshing}
        />
      }
      renderItem={({ item, index }) =>
        isCategoryRow(item)
          ? categoriesScreen.renderItem(item, index)
          : merchantsScreen.renderItem(item, index)
      }
      scrollEventThrottle={8}
      snapToEnd={false}
      style={{ flex: 1 }}
    />
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
