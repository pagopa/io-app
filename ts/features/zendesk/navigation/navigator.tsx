import { createStackNavigator } from "react-navigation-stack";
import ZendeskSupportHelpCenter from "../screens/ZendeskSupportHelpCenter";
import ZendeskAskPermissions from "../screens/ZendeskAskPermissions";
import ZendeskChooseCategory from "../screens/ZendeskChooseCategory";
import ZendeskChooseSubCategory from "../screens/ZendeskChooseSubCategory";
import ZendeskPanicMode from "../screens/ZendeskPanicMode";
import ZENDESK_ROUTES from "./routes";

export const zendeskSupportNavigator = createStackNavigator(
  {
    [ZENDESK_ROUTES.HELP_CENTER]: { screen: ZendeskSupportHelpCenter },
    [ZENDESK_ROUTES.PANIC_MODE]: { screen: ZendeskPanicMode },
    [ZENDESK_ROUTES.ASK_PERMISSIONS]: { screen: ZendeskAskPermissions },
    [ZENDESK_ROUTES.CHOOSE_CATEGORY]: { screen: ZendeskChooseCategory },
    [ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY]: { screen: ZendeskChooseSubCategory }
  },
  {
    // Let each screen handles the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);
