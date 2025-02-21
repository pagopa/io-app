import { useCallback } from "react";
import { View } from "react-native";
import {
  H2,
  TabNavigation,
  TabItem,
  VSpacer,
  IOIcons
} from "@pagopa/io-app-design-system";
import {
  MaterialTopTabBarProps,
  createMaterialTopTabNavigator
} from "@react-navigation/material-top-tabs";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import CGN_ROUTES from "../../navigation/routes";
import { useDisableRootNavigatorGesture } from "../../hooks/useDisableRootNavigatorGesture";
import CgnMerchantsListScreen from "./CgnMerchantsListScreen";
import { CgnMerchantCategoriesListScreen } from "./CgnMerchantCategoriesListScreen";

export const CgnMerchantsHomeTabRoutes = {
  CGN_CATEGORIES: "CGN_CATEGORIES",
  CGN_MERCHANTS_ALL: "CGN_MERCHANTS_ALL"
} as const;

export type CgnMerchantsHomeTabParamsList = {
  [CgnMerchantsHomeTabRoutes.CGN_CATEGORIES]: undefined;
  [CgnMerchantsHomeTabRoutes.CGN_MERCHANTS_ALL]: undefined;
};

const Tab = createMaterialTopTabNavigator<CgnMerchantsHomeTabParamsList>();

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

const CgnTabBar = ({ state, navigation }: MaterialTopTabBarProps) => {
  const isFocused = useCallback((i: number) => state.index === i, [state]);

  return (
    <View>
      <TabNavigation tabAlignment="start" selectedIndex={state.index}>
        {state.routes.map((route, index) => {
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true
            });

            if (!isFocused(index) && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const label =
            tabOptions[route.name as keyof CgnMerchantsHomeTabParamsList].title;
          return (
            <TabItem
              testID={`cgn-merchants-tab-${route.name}`}
              icon={
                tabOptions[route.name as keyof CgnMerchantsHomeTabParamsList]
                  .icon
              }
              label={label}
              accessibilityLabel={label}
              key={route.key}
              onPress={onPress}
            />
          );
        })}
      </TabNavigation>
      <VSpacer size={16} />
    </View>
  );
};
const CgnMerchantsCategoriesSelectionScreen = () => {
  const { navigate } = useIONavigation();
  useDisableRootNavigatorGesture();
  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
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

  return (
    <>
      <View style={IOStyles.horizontalContentPadding}>
        <H2 accessibilityRole="header">
          {I18n.t("bonus.cgn.merchantsList.screenTitle")}
        </H2>
      </View>
      <VSpacer />
      <Tab.Navigator
        initialRouteName={CgnMerchantsHomeTabRoutes.CGN_CATEGORIES}
        tabBarPosition="top"
        tabBar={CgnTabBar}
        screenOptions={{
          lazy: true,
          swipeEnabled: false
        }}
      >
        <Tab.Screen
          name={CgnMerchantsHomeTabRoutes.CGN_CATEGORIES}
          component={CgnMerchantCategoriesListScreen}
        />
        <Tab.Screen
          name={CgnMerchantsHomeTabRoutes.CGN_MERCHANTS_ALL}
          component={CgnMerchantsListScreen}
        />
      </Tab.Navigator>
    </>
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
