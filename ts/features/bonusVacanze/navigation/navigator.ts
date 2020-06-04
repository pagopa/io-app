import { createStackNavigator } from "react-navigation";
import AcceptTosBonusScreen from "../screens/AcceptTosBonusScreen";
import ActiveBonusScreen from "../screens/ActiveBonusScreen";
import AvailableBonusScreen from "../screens/AvailableBonusScreen";
import BonusInformationScreen from "../screens/BonusInformationScreen";
import ActivateBonusScreen from "../screens/eligibility/ActivateBonus/ActivateBonusScreen";
import IseeNotAvailableScreen from "../screens/eligibility/IseeNotAvailableScreen";
import IseeNotEligibleScreen from "../screens/eligibility/IseeNotEligibleScreen";
import LoadBonusEligibilityScreen from "../screens/eligibility/LoadBonusEligibilityScreen";
import TimeoutEligibilityCheckInfoScreen from "../screens/eligibility/TimeoutEligibilityCheckInfoScreen";
import BONUSVACANZE_ROUTES from "./routes";

const BonusVacanzeNavigator = createStackNavigator(
  {
    [BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST]: {
      screen: AvailableBonusScreen
    },
    [BONUSVACANZE_ROUTES.BONUS_REQUEST_INFORMATION]: {
      screen: BonusInformationScreen
    },
    [BONUSVACANZE_ROUTES.BONUS_TOS_SCREEN]: {
      screen: AcceptTosBonusScreen
    },
    [BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN]: {
      screen: ActiveBonusScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK]: {
      screen: LoadBonusEligibilityScreen
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
      screen: TimeoutEligibilityCheckInfoScreen
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
