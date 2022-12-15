import * as React from "react";
import { PathConfigMap } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import FciDocumentsScreen from "../screens/valid/FciDocumentsScreen";
import FciRouterScreen from "../screens/FciRouterScreen";
import FciSignatureFieldsScreen from "../screens/valid/FciSignatureFieldsScreen";
import FciDataSharingScreen from "../screens/valid/FciDataSharingScreen";
import FciQtspClausesScreen from "../screens/valid/FciQtspClausesScreen";
import { FciDocumentPreviewScreen } from "../screens/valid/FciDocumentPreviewScreen";
import { FCI_ROUTES } from "./routes";
import { FciParamsList } from "./params";

const Stack = createStackNavigator<FciParamsList>();

export const fciLinkingOptions: PathConfigMap = {
  [FCI_ROUTES.MAIN]: {
    path: "fci",
    screens: {
      [FCI_ROUTES.ROUTER]: "main"
    }
  }
};

export const FciStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={FCI_ROUTES.ROUTER}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen name={FCI_ROUTES.ROUTER} component={FciRouterScreen} />
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
      name={FCI_ROUTES.DOC_PREVIEW}
      component={FciDocumentPreviewScreen}
    />
  </Stack.Navigator>
);
