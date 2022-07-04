import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import ZendeskSupportHelpCenter from "../screens/ZendeskSupportHelpCenter";
import ZendeskAskPermissions from "../screens/ZendeskAskPermissions";
import ZendeskChooseCategory from "../screens/ZendeskChooseCategory";
import ZendeskChooseSubCategory from "../screens/ZendeskChooseSubCategory";
import ZendeskPanicMode from "../screens/ZendeskPanicMode";
import ZendeskAskSeeReportsPermissions from "../screens/ZendeskAskSeeReportsPermissions";
import ZendeskSeeReportsRouters from "../screens/ZendeskSeeReportsRouters";
import ZENDESK_ROUTES from "./routes";

export const zendeskSupportNavigator = createCompatNavigatorFactory(
  createStackNavigator
)(
  {
    [ZENDESK_ROUTES.HELP_CENTER]: { screen: ZendeskSupportHelpCenter },
    [ZENDESK_ROUTES.PANIC_MODE]: { screen: ZendeskPanicMode },
    [ZENDESK_ROUTES.ASK_PERMISSIONS]: { screen: ZendeskAskPermissions },
    [ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS]: {
      screen: ZendeskAskSeeReportsPermissions
    },
    [ZENDESK_ROUTES.SEE_REPORTS_ROUTERS]: {
      screen: ZendeskSeeReportsRouters
    },
    [ZENDESK_ROUTES.CHOOSE_CATEGORY]: { screen: ZendeskChooseCategory },
    [ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY]: { screen: ZendeskChooseSubCategory }
  },
  {
    // Let each screen handles the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gestureEnabled: false
    }
  }
);
