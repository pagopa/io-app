import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import AvailableBonusScreen from "../screens/AvailableBonusScreen";
import BonusInformationScreen, {
  BonusInformationScreenNavigationParams
} from "../screens/BonusInformationScreen";

export const BONUS_ROUTES = {
  MAIN: "BONUS_ROUTES_MAIN",
  BONUS_AVAILABLE_LIST: "BONUS_AVAILABLE_LIST",
  BONUS_REQUEST_INFORMATION: "BONUS_REQUEST_INFORMATION"
} as const;

export type BonusParamsList = {
  [BONUS_ROUTES.MAIN]: undefined;
  [BONUS_ROUTES.BONUS_AVAILABLE_LIST]: undefined;
  [BONUS_ROUTES.BONUS_REQUEST_INFORMATION]: BonusInformationScreenNavigationParams;
};

const BonusStack = createStackNavigator<BonusParamsList>();

export const BonusNavigator = () => (
  <BonusStack.Navigator
    initialRouteName={BONUS_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <BonusStack.Screen
      name={BONUS_ROUTES.BONUS_AVAILABLE_LIST}
      component={AvailableBonusScreen}
    />
    {/* this one is very much legacy, please get this out */}
    <BonusStack.Screen
      name={BONUS_ROUTES.BONUS_REQUEST_INFORMATION}
      component={BonusInformationScreen}
    />
  </BonusStack.Navigator>
);
