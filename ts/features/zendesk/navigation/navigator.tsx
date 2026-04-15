import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ZendeskAskPermissions from "../screens/ZendeskAskPermissions";
import ZendeskAskSeeReportsPermissions from "../screens/ZendeskAskSeeReportsPermissions";
import ZendeskChooseCategory from "../screens/ZendeskChooseCategory";
import ZendeskChooseSubCategory from "../screens/ZendeskChooseSubCategory";
import ZendeskPanicMode from "../screens/ZendeskPanicMode";
import ZendeskSeeReportsRouters from "../screens/ZendeskSeeReportsRouters";
import ZendeskSupportHelpCenter from "../screens/ZendeskSupportHelpCenter";
import RequestZandeskTokenErrorScreen from "../screens/RequestZandeskTokenErrorScreen";
import { ZendeskParamsList } from "./params";
import ZENDESK_ROUTES from "./routes";

const Stack = createStackNavigator<ZendeskParamsList>();

export const ZendeskStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ZENDESK_ROUTES.HELP_CENTER}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={ZENDESK_ROUTES.PANIC_MODE}
      component={ZendeskPanicMode}
    />
    <Stack.Screen
      name={ZENDESK_ROUTES.SEE_REPORTS_ROUTERS}
      component={ZendeskSeeReportsRouters}
    />

    <Stack.Group screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name={ZENDESK_ROUTES.HELP_CENTER}
        component={ZendeskSupportHelpCenter}
      />
      <Stack.Screen
        name={ZENDESK_ROUTES.ERROR_REQUEST_ZENDESK_TOKEN}
        component={RequestZandeskTokenErrorScreen}
        options={{ headerShown: false }}
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
        name={ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY}
        component={ZendeskChooseSubCategory}
      />
      <Stack.Screen
        name={ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS}
        component={ZendeskAskSeeReportsPermissions}
      />
    </Stack.Group>
  </Stack.Navigator>
);
