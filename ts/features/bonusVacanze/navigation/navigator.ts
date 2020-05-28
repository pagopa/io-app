import { createStackNavigator } from "react-navigation";
import ActivateBonusScreen from "../screens/ActivateBonus/ActivateBonusScreen";
import CheckBonusEligibilityScreen from "../screens/CheckBonusEligibilityScreen";
import IseeNotAvailableScreen from "../screens/IseeNotAvailableScreen";
import IseeNotEligibleScreen from "../screens/IseeNotEligibleScreen";
import BONUSVACANZE_ROUTES from "./routes";

const BonusVacanzeNavigator = createStackNavigator(
  {
    [BONUSVACANZE_ROUTES.ELIGIBILITY_CHECK]: {
      screen: CheckBonusEligibilityScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY_ISEE_NOT_AVAILABLE]: {
      screen: IseeNotAvailableScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY_ISEE_NOT_ELIGIBLE]: {
      screen: IseeNotEligibleScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY_ACTIVATE_BONUS]: {
      screen: ActivateBonusScreen
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
