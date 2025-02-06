import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../../utils/navigation.ts";
import {
  ItwRemoteMachineContext,
  ItwRemoteMachineProvider
} from "../machine/provider.tsx";
import { ItwRemoteClaimsDisclosureScreen } from "../screens/ItwRemoteClaimsDisclosureScreen.tsx";
import { ItwRemoteWalletInactiveScreen } from "../screens/ItwRemoteWalletInactiveScreen.tsx";
import { ITW_REMOTE_ROUTES } from "./routes.ts";
import { ItwRemoteParamsList } from "./ItwRemoteParamsList.ts";

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
      initialRouteName={ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
      screenListeners={{
        beforeRemove: () => {
          itwRemoteMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE}
        component={ItwRemoteClaimsDisclosureScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_REMOTE_ROUTES.WALLET_INACTIVE}
        component={ItwRemoteWalletInactiveScreen}
        options={hiddenHeader}
      />
    </Stack.Navigator>
  );
};
