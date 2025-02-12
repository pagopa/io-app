import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../../utils/navigation.ts";
import {
  ItwRemoteMachineContext,
  ItwRemoteMachineProvider
} from "../machine/provider.tsx";

import { ItwRemoteClaimsDisclosureScreen } from "../screens/ItwRemoteClaimsDisclosureScreen.tsx";
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
      screenOptions={{ gestureEnabled: isGestureEnabled }}
      screenListeners={{
        beforeRemove: () => {
          itwRemoteMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_REMOTE_ROUTES.REQUEST_VALIDATION}
        component={ItwRemoteRequestValidationScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE}
        component={ItwRemoteClaimsDisclosureScreen}
        options={hiddenHeader}
      />
    </Stack.Navigator>
  );
};
