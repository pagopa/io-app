import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../../utils/navigation.ts";
import {
  ItwRemoteMachineContext,
  ItwRemoteMachineProvider
} from "../machine/provider.tsx";
import { ItwRemoteAuthResponseScreen } from "../screens/ItwRemoteAuthResponseScreen.tsx";
import { ItwRemoteClaimsDisclosureScreen } from "../screens/ItwRemoteClaimsDisclosureScreen.tsx";
import { ItwRemoteFailureScreen } from "../screens/ItwRemoteFailureScreen.tsx";
import { ItwRemoteRequestValidationScreen } from "../screens/ItwRemoteRequestValidationScreen.tsx";
import { ItwRemoteParamsList } from "./ItwRemoteParamsList.ts";
import { ITW_REMOTE_ROUTES } from "./routes.ts";

const Stack = createStackNavigator<ItwRemoteParamsList>();

const hiddenHeader = { headerShown: false };

export const ItwRemoteStackNavigator = () => (
  <ItwRemoteMachineProvider>
    <InnerNavigator />
  </ItwRemoteMachineProvider>
);

const InnerNavigator = () => {
  const itwRemoteMachineRef = ItwRemoteMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={ITW_REMOTE_ROUTES.REQUEST_VALIDATION}
      screenListeners={{
        beforeRemove: () => {
          itwRemoteMachineRef.send({ type: "back" });
        }
      }}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
    >
      <Stack.Screen
        component={ItwRemoteRequestValidationScreen}
        name={ITW_REMOTE_ROUTES.REQUEST_VALIDATION}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwRemoteClaimsDisclosureScreen}
        name={ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwRemoteAuthResponseScreen}
        name={ITW_REMOTE_ROUTES.AUTH_RESPONSE}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwRemoteFailureScreen}
        name={ITW_REMOTE_ROUTES.FAILURE}
        options={hiddenHeader}
      />
    </Stack.Navigator>
  );
};
