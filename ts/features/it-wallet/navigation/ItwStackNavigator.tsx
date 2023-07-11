import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import CiePinScreen from "../screens/issuing/cie/CiePinScreen";
import CieCardReaderScreen from "../screens/issuing/cie/CieCardReaderScreen";
import CieConsentDataUsageScreen from "../screens/issuing/cie/CieConsentDataUsageScreen";
import CieExpiredOrInvalidScreen from "../screens/issuing/cie/CieExpiredOrInvalidScreen";
import CieWrongCiePinScreen from "../screens/issuing/cie/CieWrongCiePinScreen";
import ItwActivationDetailsScreen from "../screens/discovery/ItwActivationDetailsScreen";
import ItwActivationInfoAuthScreen from "../screens/issuing/ItwActivationInfoAuthScreen";
import { ItwParamsList } from "./params";
import { ITW_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <Stack.Navigator
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.DETAILS}
      component={ItwActivationDetailsScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.INFO}
      component={ItwActivationInfoAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.CIE_PIN_SCREEN}
      component={CiePinScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.CIE_CONSENT_DATA_USAGE}
      component={CieConsentDataUsageScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.CIE_CARD_READER_SCREEN}
      component={CieCardReaderScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.CIE_EXPIRED_SCREEN}
      component={CieExpiredOrInvalidScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ACTIVATION.CIE_WRONG_PIN_SCREEN}
      component={CieWrongCiePinScreen}
    />
  </Stack.Navigator>
);
