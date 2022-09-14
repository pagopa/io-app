import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import CdcBonusRequestInformationTos from "../screens/CdcBonusRequestInformationTos";
import CdcBonusRequestSelectYear from "../screens/CdcBonusRequestSelectYear";
import CdcBonusRequestSelectResidence from "../screens/CdcBonusRequestSelectResidence";
import CdcBonusRequestBonusRequested from "../screens/CdcBonusRequestBonusRequested";
import { isGestureEnabled } from "../../../../utils/navigation";
import { CdcBonusRequestParamsList } from "./params";
import { CDC_ROUTES } from "./routes";

const Stack = createStackNavigator<CdcBonusRequestParamsList>();

export const CdcStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={CDC_ROUTES.INFORMATION_TOS}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={CDC_ROUTES.INFORMATION_TOS}
      component={CdcBonusRequestInformationTos}
    />
    <Stack.Screen
      name={CDC_ROUTES.SELECT_BONUS_YEAR}
      component={CdcBonusRequestSelectYear}
    />
    <Stack.Screen
      name={CDC_ROUTES.SELECT_RESIDENCE}
      component={CdcBonusRequestSelectResidence}
    />
    <Stack.Screen
      name={CDC_ROUTES.BONUS_REQUESTED}
      component={CdcBonusRequestBonusRequested}
      options={{ gestureEnabled: false }}
    />
  </Stack.Navigator>
);
