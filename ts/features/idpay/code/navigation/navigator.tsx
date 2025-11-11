import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";
import { IdPayCodeDisplayScreen } from "../screens/IdPayCodeDisplayScreen";
import { IdPayCodeOnboardingScreen } from "../screens/IdPayCodeOnboardingScreen";
import { IdPayCodeRenewScreen } from "../screens/IdPayCodeRenewScreen";
import { IdPayCodeResultScreen } from "../screens/IdPayCodeResultScreen";
import { IdPayFeatureFlagGuard } from "../../common/components/IdPayFeatureFlagGuard";
import { IdPayCodeParamsList } from "./params";
import { IdPayCodeRoutes } from "./routes";

const Stack = createStackNavigator<IdPayCodeParamsList>();

export const IdPayCodeNavigator = () => (
  <IdPayFeatureFlagGuard>
    <Stack.Navigator
      initialRouteName={IdPayCodeRoutes.IDPAY_CODE_ONBOARDING}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen
        name={IdPayCodeRoutes.IDPAY_CODE_ONBOARDING}
        component={IdPayCodeOnboardingScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name={IdPayCodeRoutes.IDPAY_CODE_DISPLAY}
        component={IdPayCodeDisplayScreen}
      />
      <Stack.Screen
        name={IdPayCodeRoutes.IDPAY_CODE_RENEW}
        component={IdPayCodeRenewScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={IdPayCodeRoutes.IDPAY_CODE_RESULT}
        component={IdPayCodeResultScreen}
      />
    </Stack.Navigator>
  </IdPayFeatureFlagGuard>
);

export type IdPayCodeStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IdPayCodeStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IdPayCodeStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<ParamList, RouteName>;
