import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import ZendeskAskPermissions from "../screens/ZendeskAskPermissions";
import ZendeskChooseCategory from "../screens/ZendeskChooseCategory";
import ZendeskChooseSubCategory from "../screens/ZendeskChooseSubCategory";
import ZendeskPanicMode from "../screens/ZendeskPanicMode";
import ZendeskAskSeeReportsPermissions from "../screens/ZendeskAskSeeReportsPermissions";
import ZendeskSeeReportsRouters from "../screens/ZendeskSeeReportsRouters";
import ZendeskSupportHelpCenter from "../screens/ZendeskSupportHelpCenter";
import { ZendeskParamsList } from "./params";
import ZENDESK_ROUTES from "./routes";

const Stack = createStackNavigator<ZendeskParamsList>();

export const ZendeskStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ZENDESK_ROUTES.HELP_CENTER}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={ZENDESK_ROUTES.HELP_CENTER}
      component={ZendeskSupportHelpCenter}
    />
    <Stack.Screen
      name={ZENDESK_ROUTES.PANIC_MODE}
      component={ZendeskPanicMode}
    />
    <Stack.Screen
      name={ZENDESK_ROUTES.ASK_PERMISSIONS}
      component={ZendeskAskPermissions}
    />
    <Stack.Screen
      name={ZENDESK_ROUTES.CHOOSE_CATEGORY}
      component={ZendeskChooseCategory}
    />
    <Stack.Screen
      name={ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS}
      component={ZendeskAskSeeReportsPermissions}
    />
    <Stack.Screen
      name={ZENDESK_ROUTES.SEE_REPORTS_ROUTERS}
      component={ZendeskSeeReportsRouters}
    />
    <Stack.Screen
      name={ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY}
      component={ZendeskChooseSubCategory}
    />
  </Stack.Navigator>
);
