import { createStackNavigator } from "react-navigation-stack";
import ZendeskSupportHelpCenter from "../screens/ZendeskSupportHelpCenter";
import ZendeskAskPermissions from "../screens/ZendeskAskPermissions";
import ZendeskChooseCategory from "../screens/ZendeskChooseCategory";
import ZENDESK_ROUTES from "./routes";

export const zendeskSupportNavigator = createStackNavigator(
  {
    [ZENDESK_ROUTES.HELP_CENTER]: { screen: ZendeskSupportHelpCenter },
    [ZENDESK_ROUTES.ASK_PERMISSIONS]: { screen: ZendeskAskPermissions },
    [ZENDESK_ROUTES.CHOOSE_CATEGORY]: { screen: ZendeskChooseCategory }
  },
  {
    // Let each screen handles the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);
