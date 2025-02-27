import {
  IOIcons,
  TabItem,
  TabNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { IOListViewWithLargeHeader } from "../../../../../components/ui/IOListViewWithLargeHeader";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useDisableRootNavigatorGesture } from "../../hooks/useDisableRootNavigatorGesture";
import CGN_ROUTES from "../../navigation/routes";
import { CgnMerchantCategoriesListScreen } from "./CgnMerchantCategoriesListScreen";
import { CgnMerchantsListScreen, MerchantsAll } from "./CgnMerchantsListScreen";

export const CgnMerchantsHomeTabRoutes = {
  CGN_CATEGORIES: "CGN_CATEGORIES",
  CGN_MERCHANTS_ALL: "CGN_MERCHANTS_ALL"
} as const;

export type CgnMerchantsHomeTabParamsList = {
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

  return (
    <IOListViewWithLargeHeader<
      MerchantsAll | ProductCategoryWithNewDiscountsCount
    >
      keyExtractor={item => ("id" in item ? item.id : item.productCategory)}
      title={{
        label: I18n.t("bonus.cgn.merchantsList.screenTitle")
      }}
      headerActionsProp={{
        showHelp: true,
        headerType: "twoActions",
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
      }}
      renderItem={renderItem as any}
      data={[...data]}
      refreshControlProps={refreshControlProps}
      ListHeaderComponent={
        <>
          <TabNavigation
            tabAlignment="start"
            selectedIndex={Object.keys(CgnMerchantsHomeTabRoutes).indexOf(
              selectedTab
            )}
          >
            {Object.keys(CgnMerchantsHomeTabRoutes).map(routeKey => {
              const route = routeKey as keyof CgnMerchantsHomeTabParamsList;
              const onPress = () => setSelectedTab(route);

              const label = tabOptions[route].title;
              return (
                <TabItem
                  testID={`cgn-merchants-tab-${route}`}
                  icon={tabOptions[route].icon}
                  label={label}
                  accessibilityLabel={label}
                  key={route}
                  onPress={onPress}
                />
              );
            })}
          </TabNavigation>
          <VSpacer size={16} />
        </>
      }
      skeleton={skeleton}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
