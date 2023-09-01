import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { PnAttachmentPreview } from "../screens/PnAttachmentPreview";
import { PnMessageDetailsScreen } from "../screens/PnMessageDetailsScreen";
import { LegacyPnMessageDetailsScreen } from "../screens/LegacyPnMessageDetailsScreen";
import { newPnMessageDetailsEnabled } from "../../../config";
import { PnParamsList } from "./params";
import PN_ROUTES from "./routes";

const Stack = createStackNavigator<PnParamsList>();

export const PnStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={PN_ROUTES.MESSAGE_DETAILS}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={PN_ROUTES.MESSAGE_DETAILS}
      component={
        newPnMessageDetailsEnabled
          ? PnMessageDetailsScreen
          : LegacyPnMessageDetailsScreen
      }
    />
    <Stack.Screen
      name={PN_ROUTES.MESSAGE_ATTACHMENT}
      component={PnAttachmentPreview}
    />
  </Stack.Navigator>
);
