import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import I18n from "i18n-js";
import * as React from "react";
import { Platform } from "react-native";
import { makeFontStyleObject } from "../components/core/fonts";
import { IOColors } from "../components/core/variables/IOColors";
import MessagesArchiveScreen from "../screens/messages/MessagesArchiveScreen";
import MessagesInboxScreen from "../screens/messages/MessagesInboxScreen";

const Tab = createMaterialTopTabNavigator();

const MessagesHomeTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="MESSAGES_INBOX"
    tabBarPosition="top"
    tabBarOptions={{
      style: {
        elevation: 0
      },
      activeTintColor: IOColors.blue,
      inactiveTintColor: IOColors.bluegrey,
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
    lazy={true}
  >
    <Tab.Screen
      name={"MESSAGES_INBOX"}
      options={{
        title: I18n.t("messages.tab.inbox")
      }}
      component={MessagesInboxScreen}
    />
    <Tab.Screen
      name={"MESSAGES_ARCHIVE"}
      options={{
        title: I18n.t("messages.tab.archive")
      }}
      component={MessagesArchiveScreen}
    />
  </Tab.Navigator>
);

export default MessagesHomeTabNavigator;
