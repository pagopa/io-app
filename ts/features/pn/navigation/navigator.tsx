import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { LegacyMessageDetailsScreen } from "../screens/LegacyMessageDetailsScreen";
import { AttachmentPreviewScreen } from "../screens/AttachmentPreviewScreen";
import { PaidPaymentScreen } from "../screens/PaidPaymentScreen";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { PnParamsList } from "./params";
import PN_ROUTES from "./routes";

const Stack = createStackNavigator<PnParamsList>();

export const PnStackNavigator = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={PN_ROUTES.MESSAGE_DETAILS}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
    >
      <Stack.Screen
        name={PN_ROUTES.MESSAGE_DETAILS}
        component={
          isDesignSystemEnabled
            ? MessageDetailsScreen
            : LegacyMessageDetailsScreen
        }
        options={{
          headerShown: isDesignSystemEnabled
        }}
      />
      <Stack.Screen
        name={PN_ROUTES.MESSAGE_ATTACHMENT}
        component={AttachmentPreviewScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name={PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT}
        component={PaidPaymentScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};
