import * as React from "react";
import { View } from "react-native";
import {
  H2,
  TabNavigation,
  TabItem,
  VSpacer
} from "@pagopa/io-app-design-system";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
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

const CgnMerchantsCategoriesSelectionScreen = () => {
  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
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
        tabBar={({ state, descriptors, navigation }) => (
          <View>
            <TabNavigation tabAlignment="start">
              {state.routes.map((route, index) => {
                // console.log(state.index);
                const { options } = descriptors[route.key];
                const label =
                  options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                    ? options.title
                    : route.name;

                const isFocused = state.index === index;
                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };
                return (
                  <TabItem
                    selected={isFocused}
                    label={label as string}
                    accessibilityLabel={label as string}
                    key={route.key}
                    onPress={onPress}
                  />
                );
              })}
            </TabNavigation>
            <VSpacer size={16} />
          </View>
        )}
        screenOptions={{
          lazy: true
          // swipeEnabled: false
        }}
      >
        <Tab.Screen
          name={CgnMerchantsHomeTabRoutes.CGN_CATEGORIES}
          options={{
            title: "Per categoria"
          }}
          component={CgnMerchantCategoriesListScreen}
        />
        <Tab.Screen
          name={CgnMerchantsHomeTabRoutes.CGN_MERCHANTS_ALL}
          options={{
            title: "Per operatore"
          }}
          component={CgnMerchantsListScreen}
        />
      </Tab.Navigator>
    </>
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
