import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../../utils/navigation.ts";
import {
  ItwRemoteMachineContext,
  ItwRemoteMachineProvider
} from "../machine/provider.tsx";
import { ItwEidClaimsSelectionScreen } from "../screens/ItwEidClaimsSelectionScreen.tsx";
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
      initialRouteName={ITW_REMOTE_ROUTES.EID_CLAIMS_SELECTION}
      screenOptions={{ gestureEnabled: isGestureEnabled }}
      screenListeners={{
        beforeRemove: () => {
          itwRemoteMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_REMOTE_ROUTES.EID_CLAIMS_SELECTION}
        component={ItwEidClaimsSelectionScreen}
        options={hiddenHeader}
      />
    </Stack.Navigator>
  );
};
