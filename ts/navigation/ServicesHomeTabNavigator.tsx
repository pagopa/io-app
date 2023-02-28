import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import I18n from "i18n-js";
import * as React from "react";
import { Platform } from "react-native";
import { makeFontStyleObject } from "../components/core/fonts";
import { IOColors } from "../components/core/variables/IOColors";
import ServicesLocalScreen from "../screens/services/ServicesLocalScreen";
import ServicesNationalScreen from "../screens/services/ServicesNationalScreen";

const Tab = createMaterialTopTabNavigator();

const ServicesHomeTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="SERVICES_NATIONAL"
    lazy={true}
    tabBarPosition="top"
    tabBarOptions={{
      activeTintColor: IOColors.blue,
      inactiveTintColor: IOColors.bluegrey,
      style: {
        elevation: 0
      },
      tabStyle: {
        height: 40
      },
      labelStyle: {
        ...makeFontStyleObject("SemiBold"),
        fontSize: Platform.OS === "android" ? 16 : undefined,
        fontWeight: Platform.OS === "android" ? "normal" : "bold",
        textTransform: "capitalize",
        height: 34
      }
    }}
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
