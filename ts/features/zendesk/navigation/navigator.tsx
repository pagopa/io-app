import { createStackNavigator } from "react-navigation-stack";
import ZENDESK_ROUTES from "./routes";
import ZendeskSupportHelpCenter from "../screens/ZendeskSupportHelpCenter";

export const zendeskSupportNavigator = createStackNavigator(
  {
    [ZENDESK_ROUTES.HELP_CENTER]: { screen: ZendeskSupportHelpCenter }
  },
  {
    // Let each screen handles the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);
