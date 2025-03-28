import { createStackNavigator } from "@react-navigation/stack";
import { ZendeskStackNavigator } from "../features/zendesk/navigation/navigator";
import ZENDESK_ROUTES from "../features/zendesk/navigation/routes";
import { IdentificationStackNavigator } from "../features/identification/common/navigation/IdentificationStackNavigator";
import { IDENTIFICATION_ROUTES } from "../features/identification/common/navigation/routes";
import { AppParamsList } from "./params/AppParamsList";

const Stack = createStackNavigator<AppParamsList>();
const NotAuthenticatedStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={IDENTIFICATION_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: false, headerShown: false }}
  >
    <Stack.Screen
      name={IDENTIFICATION_ROUTES.MAIN}
      component={IdentificationStackNavigator}
    />

    <Stack.Group
      screenOptions={{ headerMode: "screen", presentation: "modal" }}
    >
      <Stack.Screen
        name={ZENDESK_ROUTES.MAIN}
        component={ZendeskStackNavigator}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default NotAuthenticatedStackNavigator;
