import { createStackNavigator } from "react-navigation-stack";
import WorkunitGenericFailure from "../components/error/WorkunitGenericFailure";

import BackgroundScreen from "../screens/BackgroundScreen";
import IngressScreen from "../screens/ingress/IngressScreen";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import { zendeskSupportNavigator } from "../features/zendesk/navigation/navigator";
import AuthenticationNavigator from "./AuthenticationNavigator";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import ROUTES from "./routes";

/**
 * The main stack of screens of the Application.
 */
const navigator = createStackNavigator(
  {
    [ROUTES.INGRESS]: {
      // This is the first screen that gets loaded by the app navigator
      // On component mount, the screen will dispatch an
      // APPLICATION_INITIALIZED action that gets handled by the startup saga.
      screen: IngressScreen
    },
    [ROUTES.BACKGROUND]: {
      screen: BackgroundScreen
    },
    [ROUTES.AUTHENTICATION]: {
      // The navigator used during authentication
      screen: AuthenticationNavigator
    },
    [ROUTES.ONBOARDING]: {
      // The navigator user during onboarding for authenticated users
      screen: OnboardingNavigator
    },
    [ROUTES.MAIN]: {
      // The navigator used for authenticated users on onboarding completed
      screen: MainNavigator
    },
    [ROUTES.WORKUNIT_GENERIC_FAILURE]: {
      screen: WorkunitGenericFailure
    },
    [ZENDESK_ROUTES.HELP_CENTER]: {
      screen: zendeskSupportNavigator
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default navigator;
