import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ServiceDetailsScreen } from "../../details/screens/ServiceDetailsScreen";
import { InstitutionServicesScreen } from "../../institution/screens/InstitutionServicesScreen";
import { ServicesParamsList } from "./params";
import { SERVICES_ROUTES } from "./routes";

const Stack = createStackNavigator<ServicesParamsList>();

const ServicesNavigator = () => (
  <Stack.Navigator
    initialRouteName={SERVICES_ROUTES.INSTITUTION_SERVICES}
    screenOptions={{
      headerMode: "screen"
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
  </Stack.Navigator>
);

export default ServicesNavigator;
