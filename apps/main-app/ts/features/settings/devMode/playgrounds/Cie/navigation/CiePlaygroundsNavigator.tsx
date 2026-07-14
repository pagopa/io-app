import { CieLogger } from "@pagopa/io-react-native-cie";
import { useNavigation } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import { useEffect } from "react";

import { isGestureEnabled } from "../../../../../../utils/navigation";
import { CieAttributesScreen } from "../screens/CieAttributesScreen";
import { CieAuthenticationScreen } from "../screens/CieAuthenticationScreen";
import { CieCertificateReadingScreen } from "../screens/CieCertificateScreen";
import { CieInternalAuthMrtdScreen } from "../screens/CieInternalAuthMrtdScreen";
import { CieInternalAuthScreen } from "../screens/CieInternalAuthScreen";
import { CieMrtdScreen } from "../screens/CieMrtdScreen";
import { CiePlaygrounds } from "../screens/CiePlaygrounds";
import { CieResultScreen } from "../screens/CieResultScreen";
import { CiePlaygroundsParamsList } from "./CiePlaygroundsParamsList";
import { CIE_PLAYGROUNDS_ROUTES } from "./routes";

const Stack = createStackNavigator<CiePlaygroundsParamsList>();

export const CiePlaygroundsNavigator = () => {
  /**
   * Set CIE logger to local file mode when the playground is mounted, and
   * disable it when unmounted.
   */
  useEffect(() => {
    CieLogger.setLogMode("FILE");
    return () => {
      CieLogger.setLogMode("DISABLED");
    };
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={CIE_PLAYGROUNDS_ROUTES.MAIN}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
    >
      <Stack.Screen
        component={CiePlaygrounds}
        name={CIE_PLAYGROUNDS_ROUTES.MAIN}
      />
      <Stack.Screen
        component={CieAttributesScreen}
        name={CIE_PLAYGROUNDS_ROUTES.ATTRIBUTES}
      />
      <Stack.Screen
        component={CieCertificateReadingScreen}
        name={CIE_PLAYGROUNDS_ROUTES.CERTIFICATE_READING}
      />
      <Stack.Screen
        component={CieAuthenticationScreen}
        name={CIE_PLAYGROUNDS_ROUTES.AUTHENTICATION}
      />
      <Stack.Screen
        component={CieInternalAuthScreen}
        name={CIE_PLAYGROUNDS_ROUTES.INTERNAL_AUTH}
      />
      <Stack.Screen
        component={CieMrtdScreen}
        name={CIE_PLAYGROUNDS_ROUTES.MRTD}
      />
      <Stack.Screen
        component={CieInternalAuthMrtdScreen}
        name={CIE_PLAYGROUNDS_ROUTES.INTERNAL_AUTH_MRTD}
      />
      <Stack.Screen
        component={CieResultScreen}
        name={CIE_PLAYGROUNDS_ROUTES.RESULT}
      />
    </Stack.Navigator>
  );
};

export const useCieNavigation = useNavigation<
  StackNavigationProp<CiePlaygroundsParamsList>
>;
