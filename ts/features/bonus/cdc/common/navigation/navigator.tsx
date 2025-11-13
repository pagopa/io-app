import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../../utils/navigation";
import CdcBonusRequestInformationTos from "../../activation/screens/CdcBonusRequestInformationTos";
import { CdcBonusRequestParamsList } from "./params";
import { CDC_ROUTES } from "./routes";

const Stack = createStackNavigator<CdcBonusRequestParamsList>();

export const CdcNavigator = () => (
  <Stack.Navigator
    initialRouteName={CDC_ROUTES.CDC_INFORMATION_TOS}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: true }}
  >
    <Stack.Screen
      name={CDC_ROUTES.CDC_INFORMATION_TOS}
      component={CdcBonusRequestInformationTos}
    />
  </Stack.Navigator>
);
