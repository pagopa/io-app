import * as React from "react";
import { Platform } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import I18n from "../i18n";
import { makeFontStyleObject } from "../components/core/fonts";
import { IOColors } from "../components/core/variables/IOColors";
import MessageListScreen, {
  MessagesHomeTabNavigationParams
} from "../screens/messages/MessageListScreen";

export const MessagesHomeTabRoutes = {
  MESSAGES_INBOX: "MESSAGES_INBOX",
  MESSAGES_ARCHIVE: "MESSAGES_ARCHIVE"
} as const;

export type MessagesHomeTabParamsList = {
  [MessagesHomeTabRoutes.MESSAGES_INBOX]: MessagesHomeTabNavigationParams;
  [MessagesHomeTabRoutes.MESSAGES_ARCHIVE]: MessagesHomeTabNavigationParams;
};

const Tab = createMaterialTopTabNavigator<MessagesHomeTabParamsList>();

const MessagesHomeTabNavigator = () => (
  <Tab.Navigator
    initialRouteName={MessagesHomeTabRoutes.MESSAGES_INBOX}
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
      name={MessagesHomeTabRoutes.MESSAGES_INBOX}
      options={{
        title: I18n.t("messages.tab.inbox")
      }}
      component={MessageListScreen}
      initialParams={{ category: "INBOX" }}
    />
    <Tab.Screen
      name={MessagesHomeTabRoutes.MESSAGES_ARCHIVE}
      options={{
        title: I18n.t("messages.tab.archive")
      }}
      component={MessageListScreen}
      initialParams={{ category: "ARCHIVE" }}
    />
  </Tab.Navigator>
);

export default MessagesHomeTabNavigator;
