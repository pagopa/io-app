import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LegacyServiceDetailsScreen from "../../../../screens/services/LegacyServiceDetailsScreen";
import { useIOSelector } from "../../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { isGestureEnabled } from "../../../../utils/navigation";
import { ServiceDetailsScreen } from "../../details/screens/ServiceDetailsScreen";
import { ServicesParamsList } from "./params";
import { SERVICES_ROUTES } from "./routes";

const Stack = createStackNavigator<ServicesParamsList>();

const ServicesNavigator = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={SERVICES_ROUTES.SERVICE_DETAIL}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    >
      <Stack.Screen
        name={SERVICES_ROUTES.SERVICE_DETAIL}
        component={
          isDesignSystemEnabled
            ? ServiceDetailsScreen
            : LegacyServiceDetailsScreen
        }
        options={{
          headerShown: isDesignSystemEnabled
        }}
      />
    </Stack.Navigator>
  );
};

export default ServicesNavigator;
