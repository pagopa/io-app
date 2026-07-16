import {
  Divider,
  IOColors,
  IOIcons,
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useMemo, useState } from "react";
import { Platform, RefreshControl, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import CgnAnimatedHeader from "../../components/CgnAnimatedHeader";
import { useDisableRootNavigatorGesture } from "../../hooks/useDisableRootNavigatorGesture";
import CGN_ROUTES from "../../navigation/routes";
import { CgnMerchantCategoriesListScreen } from "./CgnMerchantCategoriesListScreen";
import { CgnMerchantsListScreen } from "./CgnMerchantsListScreen";

export const CgnMerchantsHomeTabRoutes = {
  CGN_CATEGORIES: "CGN_CATEGORIES",
  CGN_MERCHANTS_ALL: "CGN_MERCHANTS_ALL"
} as const;

type CgnMerchantsHomeTabParamsList = {
  [CgnMerchantsHomeTabRoutes.CGN_CATEGORIES]: undefined;
  [CgnMerchantsHomeTabRoutes.CGN_MERCHANTS_ALL]: undefined;
};

type TabOption = {
  icon: IOIcons;
  title: string;
};

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

const CgnMerchantsCategoriesSelectionScreen = () => {
  const { navigate } = useIONavigation();
  useDisableRootNavigatorGesture();
  const { bottom } = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<
    keyof CgnMerchantsHomeTabParamsList
  >(CgnMerchantsHomeTabRoutes.CGN_CATEGORIES);

  const categoriesScreen = CgnMerchantCategoriesListScreen();
  const merchantsScreen = CgnMerchantsListScreen();

  const {
    data,
    renderItem,
    refreshControlProps,
    ListFooterComponent,
    ListEmptyComponent,
    ItemSeparatorComponent
  } =
    selectedTab === CgnMerchantsHomeTabRoutes.CGN_CATEGORIES
      ? categoriesScreen
      : merchantsScreen;

  const tabRoutesKeys = Object.keys(CgnMerchantsHomeTabRoutes);

  const animatedFlatListRef = useAnimatedRef<Animated.FlatList<unknown>>();

  const rawScrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
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

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
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
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTab]
  );

  return (
    <Animated.FlatList
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: IOVisualCostants.appMarginDefault + bottom
      }}
      data={[...data]}
      ItemSeparatorComponent={ItemSeparatorComponent ?? (() => <Divider />)}
      keyExtractor={item => item.id}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      onScroll={scrollHandler}
      ref={animatedFlatListRef}
      refreshControl={
        refreshControlProps && (
          <RefreshControl
            tintColor={Platform.OS === "ios" ? "transparent" : IOColors.black}
            {...refreshControlProps}
            onRefresh={() => {
              refreshControlProps.onRefresh();
              setIsPullRefresh(true);
            }}
            refreshing={isRefreshing}
          />
        )
      }
      renderItem={({ item, index }) => renderItem(item as any, index)}
      scrollEventThrottle={8}
      snapToEnd={false}
      style={{ flex: 1 }}
    />
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
