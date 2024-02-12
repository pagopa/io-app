import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import I18n from "i18n-js";
import * as React from "react";
import { Platform } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { makeFontStyleObject } from "../components/core/fonts";
import ServicesLocalScreen from "../screens/services/ServicesLocalScreen";
import ServicesNationalScreen from "../screens/services/ServicesNationalScreen";

const Tab = createMaterialTopTabNavigator();

const ServicesHomeTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="SERVICES_NATIONAL"
    screenOptions={{
      lazy: true,
      tabBarActiveTintColor: IOColors.blue,
      tabBarInactiveTintColor: IOColors.bluegrey,
      tabBarStyle: {
        elevation: 0
      },
      tabBarItemStyle: {
        height: 40
      },
      tabBarLabelStyle: {
        ...makeFontStyleObject("SemiBold"),
        fontSize: Platform.OS === "android" ? 16 : undefined,
        fontWeight: Platform.OS === "android" ? "normal" : "bold",
        textTransform: "capitalize",
        height: 34
      }
    }}
    tabBarPosition="top"
  >
    <Tab.Screen
      name={"SERVICES_NATIONAL"}
      options={{
        title: I18n.t("services.tab.national")
      }}
      component={ServicesNationalScreen}
    />
    <Tab.Screen
      name={"SERVICES_LOCAL"}
      options={{
        title: I18n.t("services.tab.locals")
      }}
      component={ServicesLocalScreen}
    />
  </Tab.Navigator>
);

export default ServicesHomeTabNavigator;
