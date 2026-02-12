import { PathConfigMap } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import FciDocumentsScreen from "../screens/valid/FciDocumentsScreen";
import FciRouterScreen from "../screens/FciRouterScreen";
import FciSignatureFieldsScreen from "../screens/valid/FciSignatureFieldsScreen";
import FciDataSharingScreen from "../screens/valid/FciDataSharingScreen";
import FciQtspClausesScreen from "../screens/valid/FciQtspClausesScreen";
import FciThankyouScreen from "../screens/valid/FciThankyouScreen";
import { FciDocumentPreviewScreen } from "../screens/valid/FciDocumentPreviewScreen";
import FciSignatureRequestsScreen from "../screens/valid/FciSignatureRequestsScreen";
import { AppParamsList } from "../../../navigation/params/AppParamsList";
import { FCI_ROUTES } from "./routes";
import { FciParamsList } from "./params";

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
    <Stack.Screen
      name={FCI_ROUTES.QTSP_TOS}
      component={FciQtspClausesScreen}
      options={{
        headerShown: false
      }}
    />
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
