import { createStackNavigator } from "react-navigation";
import SuggestBpdActivationScreen from "../../common/screens/bpd/SuggestBpdActivationScreen";
import ActivateBpdOnNewSatispayScreen from "../screens/ActivateBpdOnNewSatispayScreen";
import SearchSatispayManagerScreen from "../screens/search/SearchSatispayManagerScreen";
import StartSatispaySearchScreen from "../screens/StartSatispaySearchScreen";
import WALLET_ONBOARDING_SATISPAY_ROUTES from "./routes";

const PaymentMethodOnboardingSatispayNavigator = createStackNavigator(
  {
    [WALLET_ONBOARDING_SATISPAY_ROUTES.START]: {
      screen: StartSatispaySearchScreen
    },
    [WALLET_ONBOARDING_SATISPAY_ROUTES.SEARCH_AVAILABLE_USER_SATISPAY]: {
      screen: SearchSatispayManagerScreen
    },
    [WALLET_ONBOARDING_SATISPAY_ROUTES.SUGGEST_BPD_ACTIVATION]: {
      screen: SuggestBpdActivationScreen
    },
    [WALLET_ONBOARDING_SATISPAY_ROUTES.ACTIVATE_BPD_NEW_SATISPAY]: {
      screen: ActivateBpdOnNewSatispayScreen
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

export default PaymentMethodOnboardingSatispayNavigator;
