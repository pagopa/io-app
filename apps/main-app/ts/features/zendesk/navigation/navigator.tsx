import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../utils/navigation";
import RequestZandeskTokenErrorScreen from "../screens/RequestZandeskTokenErrorScreen";
import ZendeskAskPermissions from "../screens/ZendeskAskPermissions";
import ZendeskAskSeeReportsPermissions from "../screens/ZendeskAskSeeReportsPermissions";
import ZendeskChooseCategory from "../screens/ZendeskChooseCategory";
import ZendeskChooseSubCategory from "../screens/ZendeskChooseSubCategory";
import ZendeskPanicMode from "../screens/ZendeskPanicMode";
import ZendeskSeeReportsRouters from "../screens/ZendeskSeeReportsRouters";
import ZendeskSupportHelpCenter from "../screens/ZendeskSupportHelpCenter";
import { ZendeskParamsList } from "./params";
import ZENDESK_ROUTES from "./routes";

const Stack = createStackNavigator<ZendeskParamsList>();

export const ZendeskStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ZENDESK_ROUTES.HELP_CENTER}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      component={ZendeskPanicMode}
      name={ZENDESK_ROUTES.PANIC_MODE}
    />
    <Stack.Screen
      component={ZendeskSeeReportsRouters}
      name={ZENDESK_ROUTES.SEE_REPORTS_ROUTERS}
    />

    <Stack.Group screenOptions={{ headerShown: true }}>
      <Stack.Screen
        component={ZendeskSupportHelpCenter}
        name={ZENDESK_ROUTES.HELP_CENTER}
      />
      <Stack.Screen
        component={RequestZandeskTokenErrorScreen}
        name={ZENDESK_ROUTES.ERROR_REQUEST_ZENDESK_TOKEN}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ZendeskAskPermissions}
        name={ZENDESK_ROUTES.ASK_PERMISSIONS}
      />
      <Stack.Screen
        component={ZendeskChooseCategory}
        name={ZENDESK_ROUTES.CHOOSE_CATEGORY}
      />
      <Stack.Screen
        component={ZendeskChooseSubCategory}
        name={ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY}
      />
      <Stack.Screen
        component={ZendeskAskSeeReportsPermissions}
        name={ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS}
      />
    </Stack.Group>
  </Stack.Navigator>
);
