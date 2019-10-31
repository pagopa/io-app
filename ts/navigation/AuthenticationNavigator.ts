import {
  createStackNavigator,
  NavigationRouteConfigMap
} from "react-navigation";

import { environment } from "../config";
import CieValidScreen from "../screens/authentication/CieValidScreen";
import IdpLoginScreen from "../screens/authentication/IdpLoginScreen";
import IdpSelectionScreen from "../screens/authentication/IdpSelectionScreen";
import LandingScreen from "../screens/authentication/LandingScreen";
import NfcActiveScreen from "../screens/authentication/NfcActiveScreen";
import NfcStartScreen from "../screens/authentication/NfcStartScreen";
import SpidInformationScreen from "../screens/authentication/SpidInformationScreen";
import MarkdownScreen from "../screens/development/MarkdownScreen";
import ROUTES from "./routes";

// Routes loaded in production mode
const productionRouteConfigMap: NavigationRouteConfigMap = {
  [ROUTES.AUTHENTICATION_LANDING]: {
    screen: LandingScreen
  },
  [ROUTES.AUTHENTICATION_IDP_SELECTION]: {
    screen: IdpSelectionScreen
  },
  [ROUTES.AUTHENTICATION_IDP_LOGIN]: {
    screen: IdpLoginScreen
  },
  [ROUTES.AUTHENTICATION_SPID_INFORMATION]: {
    screen: SpidInformationScreen
  },
  [ROUTES.AUTHENTICATION_CIE_NFC_NOT_ENABLED]: {
    screen: NfcStartScreen
  },
  [ROUTES.AUTHENTICATION_CIE_NFC_ENABLED]: {
    screen: NfcActiveScreen
  },
  [ROUTES.MARKDOWN]: {
    screen: MarkdownScreen
  },
  [ROUTES.CIE_VALID_SCREEN]: {
    screen: CieValidScreen
  }
};

// Routes loaded on development mode
const developmentRouteConfigMap: NavigationRouteConfigMap = {
  ...productionRouteConfigMap,
  [ROUTES.MARKDOWN]: {
    screen: MarkdownScreen
  }
};

/**
 * The authentication related stack of screens of the application.
 */
const navigator = createStackNavigator(
  environment === "DEV" ? developmentRouteConfigMap : productionRouteConfigMap,
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
);

export default navigator;
