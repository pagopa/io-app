import { createStackNavigator } from "react-navigation";
import ActivateBpdOnNewCoBadgeScreen from "../screens/ActivateBpdOnNewCoBadgeScreen";
import AddCoBadgeScreen from "../screens/add-account/AddCoBadgeScreen";
import SearchAvailableCoBadgeScreen from "../screens/search/SearchAvailableCoBadgeScreen";
import CoBadgeStartScreen from "../screens/start/CoBadgeStartScreen";
import WALLET_ONBOARDING_COBADGE_ROUTES from "./routes";

const PaymentMethodOnboardingCoBadgeNavigator = createStackNavigator(
  {
    [WALLET_ONBOARDING_COBADGE_ROUTES.START]: {
      screen: CoBadgeStartScreen
    },
    [WALLET_ONBOARDING_COBADGE_ROUTES.SEARCH_AVAILABLE]: {
      screen: SearchAvailableCoBadgeScreen
    },
    [WALLET_ONBOARDING_COBADGE_ROUTES.ADD_COBADGE]: {
      screen: AddCoBadgeScreen
    },
    [WALLET_ONBOARDING_COBADGE_ROUTES.ACTIVATE_BPD_NEW]: {
      screen: ActivateBpdOnNewCoBadgeScreen
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

export default PaymentMethodOnboardingCoBadgeNavigator;
