import * as React from "react";
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
import { isGestureEnabled } from "../../../../utils/navigation";
import BONUSVACANZE_ROUTES from "./routes";
import { BonusVacanzeParamsList } from "./params";

const Stack = createStackNavigator<BonusVacanzeParamsList>();

const BonusVacanzeNavigator = () => (
  <Stack.Navigator
    initialRouteName={BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST}
      component={AvailableBonusScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.BONUS_REQUEST_INFORMATION}
      component={BonusInformationScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING}
      component={LoadBonusEligibilityScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_AVAILABLE}
      component={IseeNotAvailableScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_ELIGIBLE}
      component={IseeNotEligibleScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ELIGIBILITY.ELIGIBLE}
      component={ActivateBonusRequestScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ELIGIBILITY.PENDING}
      component={BonusActivationPending}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ELIGIBILITY.TIMEOUT}
      component={TimeoutEligibilityCheckInfoScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ELIGIBILITY.UNDERAGE}
      component={UnderageScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ACTIVATION.LOADING}
      component={LoadActivateBonusScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ACTIVATION.TIMEOUT}
      component={TimeoutActivationInfoScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ACTIVATION.EXISTS}
      component={BonusAlreadyExists}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ACTIVATION.ELIGIBILITY_EXPIRED}
      component={EligibilityExpired}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.ACTIVATION.COMPLETED}
      component={ActivateBonusCompletedScreen}
    />
    <Stack.Screen
      name={BONUSVACANZE_ROUTES.BONUS_CTA_ELIGILITY_START}
      component={BonusCTAEligibilityStartScreen}
    />
  </Stack.Navigator>
);

export default BonusVacanzeNavigator;
