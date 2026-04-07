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
   * Set CIE logger to local file mode when the playground is mounted, and disable it when unmounted.
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
        name={CIE_PLAYGROUNDS_ROUTES.MAIN}
        component={CiePlaygrounds}
      />
      <Stack.Screen
        name={CIE_PLAYGROUNDS_ROUTES.ATTRIBUTES}
        component={CieAttributesScreen}
      />
      <Stack.Screen
        name={CIE_PLAYGROUNDS_ROUTES.CERTIFICATE_READING}
        component={CieCertificateReadingScreen}
      />
      <Stack.Screen
        name={CIE_PLAYGROUNDS_ROUTES.AUTHENTICATION}
        component={CieAuthenticationScreen}
      />
      <Stack.Screen
        name={CIE_PLAYGROUNDS_ROUTES.INTERNAL_AUTH}
        component={CieInternalAuthScreen}
      />
      <Stack.Screen
        name={CIE_PLAYGROUNDS_ROUTES.MRTD}
        component={CieMrtdScreen}
      />
      <Stack.Screen
        name={CIE_PLAYGROUNDS_ROUTES.INTERNAL_AUTH_MRTD}
        component={CieInternalAuthMrtdScreen}
      />
      <Stack.Screen
        name={CIE_PLAYGROUNDS_ROUTES.RESULT}
        component={CieResultScreen}
      />
    </Stack.Navigator>
  );
};

export const useCieNavigation = useNavigation<
  StackNavigationProp<CiePlaygroundsParamsList>
>;
