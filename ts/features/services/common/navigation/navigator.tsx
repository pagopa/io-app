import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../utils/navigation";
import { ServiceDetailsScreen } from "../../details/screens/ServiceDetailsScreen";
import { InstitutionServicesScreen } from "../../institution/screens/InstitutionServicesScreen";
import { FavouriteServicesScreen } from "../../favouriteServices/FavouriteServicesScreen";
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
      name={SERVICES_ROUTES.INSTITUTION_SERVICES}
      component={InstitutionServicesScreen}
    />
    <Stack.Screen
      name={SERVICES_ROUTES.SERVICE_DETAIL}
      component={ServiceDetailsScreen}
    />
    <Stack.Screen
      name={SERVICES_ROUTES.FAVOURITE_SERVICES}
      component={FavouriteServicesScreen}
    />
  </Stack.Navigator>
);

export default ServicesNavigator;
