import { createStackNavigator } from "react-navigation-stack";
import CgnInformationScreen from "../screens/activation/CgnInformationScreen";
import CgnActivationLoadingScreen from "../screens/activation/CgnActivationLoadingScreen";
import CgnActivationPendingScreen from "../screens/activation/CgnActivationPendingScreen";
import CgnActivationTimeoutScreen from "../screens/activation/CgnActivationTimeoutScreen";
import CgnActivationCompletedScreen from "../screens/activation/CgnActivationCompletedScreen";
import CgnActivationIneligibleScreen from "../screens/activation/CgnActivationIneligibleScreen";
import CgnAlreadyActiveScreen from "../screens/activation/CgnAlreadyActiveScreen";
import CgnDetailScreen from "../screens/CgnDetailScreen";
import EycaActivationLoading from "../screens/eyca/activation/EycaActivationLoading";
import MerchantsListScreen from "../screens/merchants/CgnMerchantsListScreen";
import CgnMerchantDetailScreen from "../screens/merchants/CgnMerchantDetailScreen";
import CgnOtpScreen from "../screens/CgnOtpScreen";
import CgnCTAStartActivationScreen from "../screens/activation/CgnCTAStartActivationScreen";
import CgnMerchantsTabsScreen from "../screens/merchants/CgnMerchantsTabsScreen";

import CGN_ROUTES from "./routes";

const CgnNavigator = createStackNavigator(
  {
    [CGN_ROUTES.ACTIVATION.INFORMATION_TOS]: {
      screen: CgnInformationScreen
    },
    [CGN_ROUTES.ACTIVATION.LOADING]: {
      screen: CgnActivationLoadingScreen
    },
    [CGN_ROUTES.ACTIVATION.PENDING]: {
      screen: CgnActivationPendingScreen
    },
    [CGN_ROUTES.ACTIVATION.EXISTS]: {
      screen: CgnAlreadyActiveScreen
    },
    [CGN_ROUTES.ACTIVATION.TIMEOUT]: {
      screen: CgnActivationTimeoutScreen
    },
    [CGN_ROUTES.ACTIVATION.INELIGIBLE]: {
      screen: CgnActivationIneligibleScreen
    },
    [CGN_ROUTES.ACTIVATION.COMPLETED]: {
      screen: CgnActivationCompletedScreen
    },
    [CGN_ROUTES.EYCA.ACTIVATION.LOADING]: {
      screen: EycaActivationLoading
    },
    [CGN_ROUTES.MERCHANTS.LIST]: {
      screen: MerchantsListScreen
    },
    [CGN_ROUTES.MERCHANTS.TABS]: {
      screen: CgnMerchantsTabsScreen
    },
    [CGN_ROUTES.MERCHANTS.DETAIL]: {
      screen: CgnMerchantDetailScreen
    },
    [CGN_ROUTES.DETAILS]: {
      screen: CgnDetailScreen
    },
    [CGN_ROUTES.CTA_START_CGN]: {
      screen: CgnCTAStartActivationScreen
    },
    [CGN_ROUTES.DETAILS_OTP]: {
      screen: CgnOtpScreen
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

export default CgnNavigator;
