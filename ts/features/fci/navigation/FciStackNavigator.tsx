import { PathConfigMap } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

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
      component={FciRouterScreen}
      name={FCI_ROUTES.ROUTER}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen component={FciDocumentsScreen} name={FCI_ROUTES.DOCUMENTS} />
    <Stack.Screen
      component={FciSignatureFieldsScreen}
      name={FCI_ROUTES.SIGNATURE_FIELDS}
    />
    <Stack.Screen
      component={FciDataSharingScreen}
      name={FCI_ROUTES.USER_DATA_SHARE}
    />
    <Stack.Screen component={FciQtspClausesScreen} name={FCI_ROUTES.QTSP_TOS} />
    <Stack.Screen
      component={FciThankyouScreen}
      name={FCI_ROUTES.TYP}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      component={FciDocumentPreviewScreen}
      name={FCI_ROUTES.DOC_PREVIEW}
    />
    <Stack.Screen
      component={FciSignatureRequestsScreen}
      name={FCI_ROUTES.SIGNATURE_REQUESTS}
    />
  </Stack.Navigator>
);
