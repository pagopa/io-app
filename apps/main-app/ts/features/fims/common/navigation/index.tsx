import { createStackNavigator } from "@react-navigation/stack";

import { FimsHistoryScreen } from "../../history/screens/HistoryScreen";
import {
  FimsFlowHandlerScreen,
  FimsFlowHandlerScreenRouteParams
} from "../../singleSignOn/screens/FimsFlowHandlerScreen";

export const FIMS_ROUTES = {
  MAIN: "FIMS_MAIN",
  CONSENTS: "FIMS_SSO_CONSENTS",
  HISTORY: "FIMS_HISTORY"
} as const;

export type FimsParamsList = {
  [FIMS_ROUTES.CONSENTS]: FimsFlowHandlerScreenRouteParams;
  [FIMS_ROUTES.HISTORY]: undefined;
  [FIMS_ROUTES.MAIN]: undefined;
};

const Stack = createStackNavigator<FimsParamsList>();

export const FimsNavigator = () => (
  <Stack.Navigator
    initialRouteName={FIMS_ROUTES.MAIN}
    // Make sure to disable gestures in order to prevent
    // the user from going back by swiping and thus not
    // calling the custom cancel logic
    screenOptions={{ gestureEnabled: false, headerShown: true }}
  >
    <Stack.Screen
      component={FimsFlowHandlerScreen}
      name={FIMS_ROUTES.CONSENTS}
    />
    <Stack.Screen component={FimsHistoryScreen} name={FIMS_ROUTES.HISTORY} />
  </Stack.Navigator>
);
