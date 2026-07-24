import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation";
import { ServiceDetailsScreen } from "../../details/screens/ServiceDetailsScreen";
import { FavouriteServicesScreen } from "../../favouriteServices/screens/FavouriteServicesScreen";
import { InstitutionServicesScreen } from "../../institution/screens/InstitutionServicesScreen";
import { ServicesParamsList } from "./params";
import { SERVICES_ROUTES } from "./routes";

const Stack = createStackNavigator<ServicesParamsList>();

const ServicesNavigator = () => (
  <Stack.Navigator
    initialRouteName={SERVICES_ROUTES.INSTITUTION_SERVICES}
    screenOptions={{
      gestureEnabled: isGestureEnabled,
      headerMode: "screen",
      headerShown: true
    }}
  >
    <Stack.Screen
      component={InstitutionServicesScreen}
      name={SERVICES_ROUTES.INSTITUTION_SERVICES}
    />
    <Stack.Screen
      component={ServiceDetailsScreen}
      name={SERVICES_ROUTES.SERVICE_DETAIL}
    />
    <Stack.Screen
      component={FavouriteServicesScreen}
      name={SERVICES_ROUTES.FAVOURITE_SERVICES}
    />
  </Stack.Navigator>
);

export default ServicesNavigator;
