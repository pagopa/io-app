import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";

import { useSelector } from "@xstate/react";
import * as React from "react";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import {
  IDPayCodeOnboardingMachineProvider,
  useIDPayCodeOnboardingMachineService
} from "./xstate/provider";
import { selectCurrentPage } from "./xstate/selectors";

export const IDPayCodeOnboardingRoutes = {
  IDPAY_CODE_ONBOARDING_MAIN: "IDPAY_CODE_ONBOARDING_MAIN",
  IDPAY_CODE_ONBOARDING_INTRO: "IDPAY_CODE_ONBOARDING_INTRO",
  IDPAY_CODE_ONBOARDING_CODE_DISPLAY: "IDPAY_CODE_ONBOARDING_CODE_DISPLAY",
  IDPAY_CODE_ONBOARDING_RESULT: "IDPAY_CODE_ONBOARDING_RESULT"
} as const;

export type IDPayCodeOnboardingParamsList = {
  [IDPayCodeOnboardingRoutes.IDPAY_CODE_ONBOARDING_INTRO]: undefined;
  [IDPayCodeOnboardingRoutes.IDPAY_CODE_ONBOARDING_CODE_DISPLAY]: undefined;
  [IDPayCodeOnboardingRoutes.IDPAY_CODE_ONBOARDING_RESULT]: undefined;
};

const Stack = createStackNavigator<IDPayCodeOnboardingParamsList>();

export const IDPayCodeOnboardingNavigator = () => (
  <IDPayCodeOnboardingMachineProvider>
    <Stack.Navigator
      initialRouteName={IDPayCodeOnboardingRoutes.IDPAY_CODE_ONBOARDING_INTRO}
      headerMode={"none"}
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen
        name={IDPayCodeOnboardingRoutes.IDPAY_CODE_ONBOARDING_INTRO}
        component={MockScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name={IDPayCodeOnboardingRoutes.IDPAY_CODE_ONBOARDING_CODE_DISPLAY}
        component={MockScreen}
      />
      <Stack.Screen
        name={IDPayCodeOnboardingRoutes.IDPAY_CODE_ONBOARDING_RESULT}
        component={MockScreen}
      />
    </Stack.Navigator>
  </IDPayCodeOnboardingMachineProvider>
);

const MockScreen = () => {
  const machine = useIDPayCodeOnboardingMachineService();
  const handler = () => machine.send("NEXT");
  const currentState = useSelector(machine, selectCurrentPage);

  return (
    <OperationResultScreenContent
      title={"currentState: " + currentState.toString()}
      action={{
        onPress: handler,
        label: "Next",
        accessibilityLabel: "Next"
      }}
    />
  );
};

export type IDPayCodeOnboardingStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IDPayCodeOnboardingStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IDPayCodeOnboardingStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<ParamList, RouteName>;
