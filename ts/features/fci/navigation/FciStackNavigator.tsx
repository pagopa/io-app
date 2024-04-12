import { PathConfigMap } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import { isGestureEnabled } from "../../../utils/navigation";
import FciRouterScreen from "../screens/FciRouterScreen";
import FciDataSharingScreen from "../screens/valid/FciDataSharingScreen";
import { FciDocumentPreviewScreen } from "../screens/valid/FciDocumentPreviewScreen";
import FciDocumentsScreen from "../screens/valid/FciDocumentsScreen";
import FciQtspClausesScreen from "../screens/valid/FciQtspClausesScreen";
import FciSignatureFieldsScreen from "../screens/valid/FciSignatureFieldsScreen";
import FciSignatureRequestsScreen from "../screens/valid/FciSignatureRequestsScreen";
import FciThankyouScreen from "../screens/valid/FciThankyouScreen";
import { FciParamsList } from "./params";
import { FCI_ROUTES } from "./routes";

const Stack = createStackNavigator<FciParamsList>();

export const fciLinkingOptions: PathConfigMap<AppParamsList> = {
  [FCI_ROUTES.MAIN]: {
    path: "fci",
    screens: {
      [FCI_ROUTES.ROUTER]: "main",
      [FCI_ROUTES.SIGNATURE_REQUESTS]: "signature-requests"
    }
  }
};

export const FciStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={FCI_ROUTES.ROUTER}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      name={FCI_ROUTES.ROUTER}
      component={FciRouterScreen}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen name={FCI_ROUTES.DOCUMENTS} component={FciDocumentsScreen} />
    <Stack.Screen
      name={FCI_ROUTES.SIGNATURE_FIELDS}
      component={FciSignatureFieldsScreen}
    />
    <Stack.Screen
      name={FCI_ROUTES.USER_DATA_SHARE}
      component={FciDataSharingScreen}
    />
    <Stack.Screen name={FCI_ROUTES.QTSP_TOS} component={FciQtspClausesScreen} />
    <Stack.Screen
      name={FCI_ROUTES.TYP}
      component={FciThankyouScreen}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      name={FCI_ROUTES.DOC_PREVIEW}
      component={FciDocumentPreviewScreen}
    />
    <Stack.Screen
      name={FCI_ROUTES.SIGNATURE_REQUESTS}
      component={FciSignatureRequestsScreen}
    />
  </Stack.Navigator>
);
