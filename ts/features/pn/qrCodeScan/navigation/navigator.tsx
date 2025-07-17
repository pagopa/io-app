import { createStackNavigator } from "@react-navigation/stack";
import { SendQRScanFlowProps, SendQrScanFlow } from "../screens/QrScanFlow";

export const PN_QR_SCAN_ROUTES = {
  MAIN: "PN_QR_CODE_SCAN_MAIN",
  QR_SCAN_FLOW: "PN_QR_CODE_SCAN_FLOW"
} as const;
export type PnQrCodeScanParamList = {
  [PN_QR_SCAN_ROUTES.QR_SCAN_FLOW]: SendQRScanFlowProps;
};

const Stack = createStackNavigator<PnQrCodeScanParamList>();

export const PnQRStackNavigator = () => (
  <Stack.Navigator initialRouteName={PN_QR_SCAN_ROUTES.QR_SCAN_FLOW}>
    <Stack.Screen
      name={PN_QR_SCAN_ROUTES.QR_SCAN_FLOW}
      component={SendQrScanFlow}
      options={{
        headerShown: false
      }}
    />
  </Stack.Navigator>
);
