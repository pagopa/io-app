import {
  Divider,
  IOColors,
  IOIcons,
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useState } from "react";
import { View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import Animated, { useAnimatedRef } from "react-native-reanimated";
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
  title: string;
  icon: IOIcons;
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
    skeleton
  } =
    selectedTab === CgnMerchantsHomeTabRoutes.CGN_CATEGORIES
      ? categoriesScreen
      : merchantsScreen;

  const tabRoutesKeys = Object.keys(CgnMerchantsHomeTabRoutes);

  const ListHeaderComponent = (
    <>
      <TabNavigation
        includeContentMargins={true}
        tabAlignment="start"
        selectedIndex={tabRoutesKeys.indexOf(selectedTab)}
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
              testID={`cgn-merchants-tab-${route}`}
              icon={tabOptions[route].icon}
              label={label}
              accessibilityLabel={accessibilityLabel}
              key={route}
              onPress={onPress}
            />
          );
        })}
      </TabNavigation>
      <VSpacer size={16} />
    </>
  );
  const animatedFlatListRef = useAnimatedRef<any>();

  useHeaderSecondLevel({
    title: I18n.t("bonus.cgn.merchantsList.screenTitle"),
    enableDiscreteTransition: true,
    animatedRef: animatedFlatListRef,
    transparent: true,
    supportRequest: true,
    canGoBack: true,
    secondAction: {
      icon: "search",
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

  return (
    <View style={{ flex: 1 }}>
      <CgnAnimatedHeader ref={animatedFlatListRef}>
        {ListHeaderComponent}
      </CgnAnimatedHeader>
      <Animated.FlatList
        data={[...data]}
        keyExtractor={item => ("id" in item ? item.id : item.productCategory)}
        renderItem={({ item, index }) => renderItem(item as any, index)}
        refreshControl={
          refreshControlProps && (
            <RefreshControl
              tintColor={IOColors.black}
              {...refreshControlProps}
            />
          )
        }
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        ItemSeparatorComponent={() => <Divider />}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: IOVisualCostants.appMarginDefault
        }}
      />
    </View>
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
