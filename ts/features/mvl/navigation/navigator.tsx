import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { MvlAttachmentPreview } from "../screens/details/components/attachment/MvlAttachmentPreview";
import { MvlCertificatesScreen } from "../screens/metadata/MvlCertificatesScreen";
import { MvlRecipientsScreen } from "../screens/metadata/MvlRecipientsScreen";
import { MvlSignatureScreen } from "../screens/metadata/MvlSignatureScreen";
import { MvlRouterScreen } from "../screens/MvlRouterScreen";
import { MvlParamsList } from "./params";
import MVL_ROUTES from "./routes";

const Stack = createStackNavigator<MvlParamsList>();

export const MvlStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={MVL_ROUTES.DETAILS}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: true }}
  >
    <Stack.Screen name={MVL_ROUTES.DETAILS} component={MvlRouterScreen} />
    <Stack.Screen
      name={MVL_ROUTES.CERTIFICATES}
      component={MvlCertificatesScreen}
    />
    <Stack.Screen
      name={MVL_ROUTES.RECIPIENTS}
      component={MvlRecipientsScreen}
    />
    <Stack.Screen name={MVL_ROUTES.SIGNATURE} component={MvlSignatureScreen} />
    <Stack.Screen
      name={MVL_ROUTES.ATTACHMENT}
      component={MvlAttachmentPreview}
    />
  </Stack.Navigator>
);
