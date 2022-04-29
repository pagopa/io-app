import { createCompatNavigatorFactory } from "@react-navigation/compat";
import { createStackNavigator } from "@react-navigation/stack";
import ActivateBonusCompletedScreen from "../screens/activation/ActivateBonusCompletedScreen";
import BonusAlreadyExists from "../screens/activation/BonusAlreadyExists";
import EligibilityExpired from "../screens/activation/EligibilityExpired";
import LoadActivateBonusScreen from "../screens/activation/LoadActivateBonusScreen";
import ActivateBonusRequestScreen from "../screens/activation/request/ActivateBonusRequestScreen";
import TimeoutActivationInfoScreen from "../screens/activation/TimeoutActivationInfoScreen";
import AvailableBonusScreen from "../screens/AvailableBonusScreen";
import BonusCTAEligibilityStartScreen from "../screens/BonusCTAEligibilityStartScreen";
import BonusInformationScreen from "../screens/BonusInformationScreen";
import BonusActivationPending from "../screens/eligibility/BonusActivationPending";
import IseeNotAvailableScreen from "../screens/eligibility/isee/IseeNotAvailableScreen";
import IseeNotEligibleScreen from "../screens/eligibility/isee/IseeNotEligibleScreen";
import LoadBonusEligibilityScreen from "../screens/eligibility/LoadBonusEligibilityScreen";
import TimeoutEligibilityCheckInfoScreen from "../screens/eligibility/TimeoutEligibilityCheckInfoScreen";
import UnderageScreen from "../screens/eligibility/UnderageScreen";
import BONUSVACANZE_ROUTES from "./routes";

const BonusVacanzeNavigator = createCompatNavigatorFactory(
  createStackNavigator
)(
  {
    [BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST]: {
      screen: AvailableBonusScreen
    },
    [BONUSVACANZE_ROUTES.BONUS_REQUEST_INFORMATION]: {
      screen: BonusInformationScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING]: {
      screen: LoadBonusEligibilityScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_AVAILABLE]: {
      screen: IseeNotAvailableScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_ELIGIBLE]: {
      screen: IseeNotEligibleScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.ELIGIBLE]: {
      screen: ActivateBonusRequestScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.TIMEOUT]: {
      screen: TimeoutEligibilityCheckInfoScreen
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.PENDING]: {
      screen: BonusActivationPending
    },
    [BONUSVACANZE_ROUTES.ELIGIBILITY.UNDERAGE]: {
      screen: UnderageScreen
    },
    [BONUSVACANZE_ROUTES.ACTIVATION.LOADING]: {
      screen: LoadActivateBonusScreen
    },
    [BONUSVACANZE_ROUTES.ACTIVATION.TIMEOUT]: {
      screen: TimeoutActivationInfoScreen
    },
    [BONUSVACANZE_ROUTES.ACTIVATION.EXISTS]: {
      screen: BonusAlreadyExists
    },
    [BONUSVACANZE_ROUTES.ACTIVATION.ELIGIBILITY_EXPIRED]: {
      screen: EligibilityExpired
    },
    [BONUSVACANZE_ROUTES.ACTIVATION.COMPLETED]: {
      screen: ActivateBonusCompletedScreen
    },
    [BONUSVACANZE_ROUTES.BONUS_CTA_ELIGILITY_START]: {
      screen: BonusCTAEligibilityStartScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gestureEnabled: false
    }
  }
);

export default BonusVacanzeNavigator;
