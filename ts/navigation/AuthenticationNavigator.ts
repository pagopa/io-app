import {
  createStackNavigator,
  NavigationRouteConfigMap
} from "react-navigation";

import { environment } from "../config";
import CardSelectionScreen from "../screens/authentication/CardSelectionScreen";
import CieCardReaderScreen from "../screens/authentication/CieCardReaderScreen";
import CieExpiredOrInvalidScreen from "../screens/authentication/CieExpiredOrInvalidScreen";
import CiePinScreen from "../screens/authentication/CiePinScreen";
import CieSuccessScreen from "../screens/authentication/CieSuccessScreen";
import CieValidScreen from "../screens/authentication/CieValidScreen";
import IdpLoginScreen from "../screens/authentication/IdpLoginScreen";
import IdpSelectionScreen from "../screens/authentication/IdpSelectionScreen";
import InterruptedReadingCardScreen from "../screens/authentication/InterruptedReadingCardScreen";
import LandingScreen from "../screens/authentication/LandingScreen";
import NfcEnabledScreen from "../screens/authentication/NfcEnabledScreen";
import SpidCIEInformationScreen from "../screens/authentication/SpidCIEInformationScreen";
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
  [ROUTES.AUTHENTICATION_CIE]: {
    screen: CardSelectionScreen
  },
  [ROUTES.AUTHENTICATION_IDP_LOGIN]: {
    screen: IdpLoginScreen
  },
  [ROUTES.AUTHENTICATION_SPID_INFORMATION]: {
    screen: SpidInformationScreen
  },
  [ROUTES.AUTHENTICATION_SPID_CIE_INFORMATION]: {
    screen: SpidCIEInformationScreen
  },
  [ROUTES.MARKDOWN]: {
    screen: MarkdownScreen
  },
  // For expired cie screen
  [ROUTES.CIE_EXPIRED_SCREEN]: {
    screen: CieExpiredOrInvalidScreen
  },
  // For valid cie screen
  [ROUTES.CIE_VALID_SCREEN]: {
    screen: CieValidScreen
  },
  [ROUTES.CIE_READER_SCREEN]: {
    screen: CieCardReaderScreen
  },
  // For CIE success screen
  [ROUTES.CIE_SUCCESS_SCREEN]: {
    screen: CieSuccessScreen
  },
  [ROUTES.CIE_INTERRUPTED_READING_CARD_SCREEN]: {
    screen: InterruptedReadingCardScreen
  },
  [ROUTES.CIE_PIN_SCREEN]: {
    screen: CiePinScreen
  },
  [ROUTES.CIE_NFC_ENABLED]: {
    screen: NfcEnabledScreen
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
