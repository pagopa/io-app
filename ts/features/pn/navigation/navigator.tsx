import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { isGestureEnabled } from "../../../utils/navigation";
import { LegacyAttachmentPreviewScreen } from "../screens/LegacyAttachmentPreviewScreen";
import { LegacyMessageDetailsScreen } from "../screens/LegacyMessageDetailsScreen";
import { MessageAttachmentScreen } from "../screens/MessageAttachmentScreen";
import { MessageDetailsScreen } from "../screens/MessageDetailsScreen";
import { PaidPaymentScreen } from "../screens/PaidPaymentScreen";
import { LegacyPaidPaymentScreen } from "../screens/LegacyPaidPaymentScreen";
import { PnParamsList } from "./params";
import PN_ROUTES from "./routes";

const Stack = createStackNavigator<PnParamsList>();

export const PnStackNavigator = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);

  return (
    <Stack.Navigator
      initialRouteName={PN_ROUTES.MESSAGE_DETAILS}
      screenOptions={{
        gestureEnabled: isGestureEnabled,
        headerMode: "screen",
        headerShown: isDesignSystemEnabled
      }}
    >
      <Stack.Screen
        name={PN_ROUTES.MESSAGE_DETAILS}
        component={
          isDesignSystemEnabled
            ? MessageDetailsScreen
            : LegacyMessageDetailsScreen
        }
      />
      <Stack.Screen
        name={PN_ROUTES.MESSAGE_ATTACHMENT}
        component={
          isDesignSystemEnabled
            ? MessageAttachmentScreen
            : LegacyAttachmentPreviewScreen
        }
      />
      <Stack.Screen
        name={PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT}
        component={
          isDesignSystemEnabled ? PaidPaymentScreen : LegacyPaidPaymentScreen
        }
      />
    </Stack.Navigator>
  );
};
