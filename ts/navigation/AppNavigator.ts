import { createStackNavigator } from "react-navigation-stack";
import WorkunitGenericFailure from "../components/error/WorkunitGenericFailure";
import { uaDonationsEnabled, zendeskEnabled } from "../config";
import {
  CgnActivationNavigator,
  CgnDetailsNavigator,
  CgnEYCAActivationNavigator
} from "../features/bonus/cgn/navigation/navigator";
import CGN_ROUTES from "../features/bonus/cgn/navigation/routes";
import { zendeskSupportNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";

import BackgroundScreen from "../screens/BackgroundScreen";
import IngressScreen from "../screens/ingress/IngressScreen";
import UADonationNavigator from "../features/uaDonations/navigation/navigator";
import UADONATION_ROUTES from "../features/uaDonations/navigation/routes";
import AuthenticationNavigator from "./AuthenticationNavigator";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import ROUTES from "./routes";

/**
 * The main stack of screens of the Application.
 */
// eslint-disable-next-line functional/no-let
let configMap = {
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
  }
};

const cgnConfigMap = {
  [CGN_ROUTES.ACTIVATION.MAIN]: {
    screen: CgnActivationNavigator
  },
  [CGN_ROUTES.DETAILS.MAIN]: {
    screen: CgnDetailsNavigator
  },
  [CGN_ROUTES.EYCA.ACTIVATION.MAIN]: {
    screen: CgnEYCAActivationNavigator
  }
};
configMap = { ...configMap, ...cgnConfigMap };

// The addition of the screen to the stack is only protected by local FF
if (zendeskEnabled) {
  const zendeskMap = {
    [ZENDESK_ROUTES.MAIN]: {
      screen: zendeskSupportNavigator
    }
  };
  configMap = { ...configMap, ...zendeskMap };
}

if (uaDonationsEnabled) {
  const uaConfigMap = {
    [UADONATION_ROUTES.MAIN]: {
      screen: UADonationNavigator
    }
  };
  configMap = { ...configMap, ...uaConfigMap };
}

const navigator = createStackNavigator(configMap, {
  // Let each screen handle the header and navigation
  headerMode: "none",
  defaultNavigationOptions: {
    gesturesEnabled: false
  }
});

export default navigator;
