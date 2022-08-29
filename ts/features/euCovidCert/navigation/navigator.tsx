import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import EuCovidCertificateRouterScreen from "../screens/EuCovidCertificateRouterScreen";
import { EuCovidCertMarkdownDetailsScreen } from "../screens/valid/EuCovidCertMarkdownDetailsScreen";
import { EuCovidCertQrCodeFullScreen } from "../screens/valid/EuCovidCertQrCodeFullScreen";
import { EUCovidCertParamsList } from "./params";
import EUCOVIDCERT_ROUTES from "./routes";

const Stack = createStackNavigator<EUCovidCertParamsList>();

export const EUCovidCertStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={EUCOVIDCERT_ROUTES.CERTIFICATE}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={EUCOVIDCERT_ROUTES.CERTIFICATE}
      component={EuCovidCertificateRouterScreen}
    />
    <Stack.Screen
      name={EUCOVIDCERT_ROUTES.QRCODE}
      component={EuCovidCertQrCodeFullScreen}
    />
    <Stack.Screen
      name={EUCOVIDCERT_ROUTES.MARKDOWN_DETAILS}
      component={EuCovidCertMarkdownDetailsScreen}
    />
  </Stack.Navigator>
);
