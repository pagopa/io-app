import { createStackNavigator } from "react-navigation";
import ActivateBonusScreen from "../screens/eligibility/ActivateBonus/ActivateBonusScreen";
import AsyncEligibilityCheckInfoScreen from "../screens/eligibility/AsyncEligibilityCheckInfoScreen";
import CheckBonusEligibilityScreen from "../screens/eligibility/CheckBonusEligibilityScreen";
import IseeNotAvailableScreen from "../screens/eligibility/IseeNotAvailableScreen";
import IseeNotEligibleScreen from "../screens/eligibility/IseeNotEligibleScreen";
import BONUSVACANZE_ROUTES from "./routes";

const BonusVacanzeNavigator = createStackNavigator(
  {
    [BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK]: {
      screen: CheckBonusEligibilityScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_AVAILABLE]: {
      screen: IseeNotAvailableScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_ELIGIBLE]: {
      screen: IseeNotEligibleScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.ACTIVATE_BONUS]: {
      screen: ActivateBonusScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.TIMEOUT]: {
      screen: AsyncEligibilityCheckInfoScreen
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

export default BonusVacanzeNavigator;
